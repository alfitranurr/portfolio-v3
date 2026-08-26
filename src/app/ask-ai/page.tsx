import { AIChatInterface } from '@/components/ai-chat-interface'
import { Bot, Globe } from 'lucide-react'

export const metadata = {
  title: 'Ask AI',
  description: 'Chat with an AI assistant that knows everything about Al Fitra Nur Ramadhani — projects, skills, experience, and more. Powered by Gemini + Google Search.',
}

export default function AskAIPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3 sm:space-y-4 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Ask AI</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Interact with an AI assistant trained on my professional background and projects
          </p>
        </div>

        {/* Al Fitra AI Assistant Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-xs shrink-0">
          <div className="relative shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-xs sm:text-sm leading-tight">
              Al Fitra AI
            </h2>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 leading-none">
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500 shrink-0" />
              <span>Gemini + Search</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface Container */}
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <AIChatInterface />
      </div>
    </div>
  )
}
