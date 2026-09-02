/* cspell:disable */
import { GoogleGenAI } from '@google/genai'
import { buildRAGContext, buildSystemPrompt } from '@/lib/rag-context'
import { getAISettings, logAIChat } from '@/lib/ai-service'

// Force recompile rag-context module
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages array is required and must not be empty.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured. Please add it to .env.local' },
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

    // Capture requester's IP for audit purposes
    // x-forwarded-for may be a comma-separated chain; the first entry is the
    // originating client IP (subsequent entries are downstream proxies).
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = (forwardedFor && forwardedFor.split(',')[0].trim()) || '127.0.0.1'

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

          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(text))
              completeText += text
            }
            if (chunk.usageMetadata) {
              finalMetadata = chunk.usageMetadata
            }
          }
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
            user_ip: ip,
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

    return Response.json(
      { error: errorObj?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
