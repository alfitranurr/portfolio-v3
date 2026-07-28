import { AIChatInterface } from '@/components/ai-chat-interface'
import { Bot, Globe } from 'lucide-react'

export const metadata = {
  title: 'Ask AI',
  description: 'Chat with an AI assistant that knows everything about Al Fitra Nur Ramadhani — projects, skills, experience, and more. Powered by Gemini + Google Search.',
}

export default function AskAIPage() {
  return (
    <div className="space-y-3 sm:space-y-6 h-[calc(100dvh-6.8rem)] sm:h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-4.5rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight leading-tight">Ask AI</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Interact with an AI assistant trained on my professional background and projects
          </p>
          <p className="text-[11px] text-muted-foreground block sm:hidden leading-none truncate max-w-[160px]">
            AI Assistant — Al Fitra
          </p>
        </div>

        {/* Al Fitra AI Assistant Badge at Top Right */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 shadow-sm shrink-0">
          <div className="relative shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-[11px] sm:text-sm leading-tight">
              <span className="inline sm:hidden">Al Fitra AI</span>
              <span className="hidden sm:inline">Al Fitra AI Assistant</span>
            </h2>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500 shrink-0" />
              <span className="inline sm:hidden">Gemini + Search</span>
              <span className="hidden sm:inline">Powered by Gemini + Google Search</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-grow min-h-0">
        <AIChatInterface />
      </div>
    </div>
  )
}

