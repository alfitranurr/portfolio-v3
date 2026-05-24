import { GoogleGenAI } from '@google/genai'
import { buildRAGContext, buildSystemPrompt } from '@/lib/rag-context'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured. Please add it to .env.local' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages array is required and must not be empty.' },
        { status: 400 }
      )
    }

    // Build RAG context from all portfolio data
    const ragContext = await buildRAGContext()
    const systemPrompt = buildSystemPrompt(ragContext)

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey })

    // Limit chat history to the last 10 messages (approx 5 conversational turns)
    // to minimize token usage (TPM) and prevent rate limits.
    const maxHistory = 10
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

    // Create streaming chat with Google Search grounding for real-time web info
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (err: any) {
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
  } catch (err: any) {
    console.error('Chat API error:', err)

    // Parse Gemini quota / rate limit errors
    const errMsg = String(err.message || err || '')
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      return Response.json(
        { error: 'AI sedang sibuk (rate limit). Silakan coba lagi dalam beberapa detik.' },
        { status: 429 }
      )
    }

    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
