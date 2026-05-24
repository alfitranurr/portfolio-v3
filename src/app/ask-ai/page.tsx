import { AIChatInterface } from '@/components/ai-chat-interface'

export const metadata = {
  title: 'Ask AI',
  description: 'Chat with an AI assistant that knows everything about Al Fitra Nur Ramadhani — projects, skills, experience, and more. Powered by Gemini + Google Search.',
}

export default function AskAIPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-4.5rem)] flex flex-col">
      {/* Page Header */}
      <div className="space-y-1 shrink-0">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Ask AI</h1>
        <p className="text-sm text-muted-foreground">
          Interact with an AI assistant trained on my professional background and projects
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex-grow min-h-0">
        <AIChatInterface />
      </div>
    </div>
  )
}
