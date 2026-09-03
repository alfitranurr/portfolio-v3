/* cspell:disable */
import { GoogleGenAI } from '@google/genai'
import { buildRAGContext, buildSystemPrompt } from '@/lib/rag-context'
import { getAISettings, logAIChat, anonymizeIP } from '@/lib/ai-service'

// Force recompile rag-context module
export const dynamic = 'force-dynamic'

// --- Security: Input validation limits ---
const MAX_MESSAGES = 50          // Max messages in a single request
const MAX_MESSAGE_LENGTH = 4000  // Max chars per message (≈1000 tokens)
const MAX_TOTAL_LENGTH = 20000   // Max total chars across all messages

// --- Security: In-memory rate limiting (per-IP) ---
// Reuses the same throttle pattern as admin/actions/analytics.ts.
// Lost on cold-start, which is acceptable for a public chat endpoint;
// Gemini's own 429 acts as a second backstop.
const RATE_LIMIT_WINDOW_MS = 60_000   // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10    // max 10 requests per IP per minute
const RATE_LIMIT_MAX_ENTRIES = 10_000 // prevent unbounded Map growth
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    // Opportunistic cleanup
    if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
      for (const [k, v] of rateLimitMap) {
        if (now >= v.resetAt) rateLimitMap.delete(k)
      }
    }
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX_REQUESTS
}

// --- Security: Output guardrail ---
// Blocks responses that leak the system prompt preamble.
// The system prompt starts with "Kamu adalah asisten AI cerdas" and contains
// "## ATURAN UTAMA:" and "## DATA PORTFOLIO AL FITRA:" markers.
const SYSTEM_PROMPT_MARKERS = [
  '## ATURAN UTAMA',
  '## DATA PORTFOLIO AL FITRA',
  'Kamu adalah asisten AI cerdas untuk website portfolio',
  'Prioritaskan data portfolio',
]

function isSystemPromptLeak(text: string): boolean {
  const lower = text.toLowerCase()
  return SYSTEM_PROMPT_MARKERS.some((marker) =>
    lower.includes(marker.toLowerCase())
  )
}

export async function POST(request: Request) {
  try {
    // --- Security: Rate limit check (per-IP) ---
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = (forwardedFor && forwardedFor.split(',')[0].trim()) || '127.0.0.1'
    if (isRateLimited(clientIp)) {
      return Response.json(
        { error: 'Too many requests. Please slow down and try again in a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      )
    }
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    // --- Security: Input validation ---
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages array is required and must not be empty.' },
        { status: 400 }
      )
    }
    if (messages.length > MAX_MESSAGES) {
      return Response.json(
        { error: `Too many messages. Maximum ${MAX_MESSAGES} messages per request.` },
        { status: 400 }
      )
    }
    let totalLength = 0
    for (const msg of messages) {
      if (typeof msg.content !== 'string' || msg.content.length === 0) {
        return Response.json(
          { error: 'Each message must have non-empty string content.' },
          { status: 400 }
        )
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return Response.json(
          { error: 'Invalid message role. Only "user" and "assistant" are allowed.' },
          { status: 400 }
        )
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return Response.json(
          { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters per message.` },
          { status: 400 }
        )
      }
      totalLength += msg.content.length
    }
    if (totalLength > MAX_TOTAL_LENGTH) {
      return Response.json(
        { error: `Total message content too long. Maximum ${MAX_TOTAL_LENGTH} characters.` },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'AI service is not configured.' },
        { status: 500 }
      )
    }

    // Fetch user AI config dynamically
    const settings = await getAISettings()

    // Build RAG context from all portfolio data
    const ragContext = await buildRAGContext()
    const systemPrompt = buildSystemPrompt(ragContext)

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey })

    // Limit chat history based on user settings (default to 10 if not set)
    const maxHistory = settings.max_history || 10
    const historyMessages = messages.slice(0, -1).slice(-maxHistory)

    // Convert message history to Gemini format
    const geminiHistory = historyMessages.map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    // Combine history and the new message into contents parameter
    const contents = [
      ...geminiHistory,
      {
        role: 'user' as const,
        parts: [{ text: lastMessage.content }],
      },
    ]

    // Configure tools dynamically based on search grounding settings
    const tools = settings.search_grounding ? [{ googleSearch: {} }] : undefined

    // Create streaming chat with dynamic settings
    const stream = await ai.models.generateContentStream({
      model: settings.model_name || 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: settings.temperature !== undefined ? settings.temperature : 0.7,
        tools,
      },
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let completeText = ''
          let finalMetadata: {
            promptTokenCount?: number
            candidatesTokenCount?: number
            totalTokenCount?: number
          } | null = null

          // --- Security: Buffer full response before sending ---
          // This sacrifices streaming UX to ensure the output guardrail
          // can block system prompt leakage BEFORE any text reaches the client.
          // Once chunks are enqueued they cannot be un-sent, so we validate
          // the complete response first.
          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              completeText += text
            }
            if (chunk.usageMetadata) {
              finalMetadata = chunk.usageMetadata
            }
          }

          // --- Security: Output guardrail — block system prompt leakage ---
          if (isSystemPromptLeak(completeText)) {
            console.warn('System prompt leak detected and blocked.')
            controller.enqueue(
              encoder.encode('⚠️ Maaf, saya tidak bisa membagikan instruksi sistem saya. Bagaimana saya bisa membantu Anda memahami profil Al Fitra?')
            )
            controller.close()
            return
          }

          // Send the validated response
          controller.enqueue(encoder.encode(completeText))
          controller.close()

          // Log AI Chat token usage asynchronously
          const promptTokens = finalMetadata?.promptTokenCount || Math.ceil(lastMessage.content.length / 4)
          const completionTokens = finalMetadata?.candidatesTokenCount || Math.ceil(completeText.length / 4)
          const totalTokens = finalMetadata?.totalTokenCount || (promptTokens + completionTokens)

          logAIChat({
            prompt_preview: lastMessage.content.slice(0, 500),
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
            model_name: settings.model_name || 'gemini-2.5-flash',
            search_grounding: settings.search_grounding,
            user_ip: anonymizeIP(clientIp),
          }).catch((err) => console.error('Failed async logging of chat event:', err))

        } catch (err) {
          console.error('Gemini streaming error:', err)
          controller.enqueue(
            encoder.encode('\n\n⚠️ Terjadi error saat memproses respons AI.')
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)

    // Parse Gemini quota / rate limit errors
    const errorObj = err as Error
    const errMsg = String(errorObj?.message || err || '')
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      return Response.json(
        { error: 'AI sedang sibuk (rate limit). Silakan coba lagi dalam beberapa detik.' },
        { status: 429 }
      )
    }

    // --- Security: Don't leak raw internal errors to client ---
    return Response.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
