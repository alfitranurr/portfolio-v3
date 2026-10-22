import { AIChatInterface } from '@/components/ai-chat-interface'

export const metadata = {
  title: 'Ask AI',
  description: 'Chat with an AI assistant that knows everything about Al Fitra Nur Ramadhani — projects, skills, experience, and more. Powered by Gemini + Google Search.',
}

export default function AskAIPage() {
  return (
    // Fill exactly the viewport left after <main> padding (mobile: pt-20 + pb-6).
    // lg: card bottom sits 16px from the viewport edge, aligned with the sticky sidebar (top-4, 100vh-2rem);
    // -mb-2 pulls back the extra 8px of main's pb-6 so the page itself never scrolls.
    <div className="flex flex-col gap-4 sm:gap-6 w-full h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-3rem)] lg:-mb-2 min-h-[440px]">
      {/* Page Header */}
      <div className="space-y-0.5 sm:space-y-1 shrink-0">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Ask AI</h1>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          Interact with an AI assistant trained on my professional background and projects
        </p>
      </div>

      {/* Chat Interface Container */}
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <AIChatInterface />
      </div>
    </div>
  )
}
