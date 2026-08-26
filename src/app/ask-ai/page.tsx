import { AIChatInterface } from '@/components/ai-chat-interface'
import { Bot, Globe } from 'lucide-react'

export const metadata = {
  title: 'Ask AI',
  description: 'Chat with an AI assistant that knows everything about Al Fitra Nur Ramadhani — projects, skills, experience, and more. Powered by Gemini + Google Search.',
}

export default function AskAIPage() {
  return (
    <div className="flex flex-col h-[calc(100dvh-6.2rem)] sm:h-[calc(100vh-7rem)] lg:h-[calc(100vh-4.5rem)] space-y-2 sm:space-y-3 pb-1">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">Ask AI</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Interact with an AI assistant trained on my professional background and projects
          </p>
        </div>

        {/* Al Fitra AI Assistant Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-xs shrink-0">
          <div className="relative shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-[11px] sm:text-xs leading-tight">
              Al Fitra AI
            </h2>
            <p className="text-[9px] text-muted-foreground flex items-center gap-1 leading-none mt-0.5">
              <Globe className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
              <span>Gemini + Search</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface Container */}
      <div className="flex-1 min-h-0 w-full">
        <AIChatInterface />
      </div>
    </div>
  )
}
