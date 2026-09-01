import * as React from 'react'
import { Clock } from 'lucide-react'

export function RealTimeClock() {
  const [time, setTime] = React.useState<string>('')
  const [date, setDate] = React.useState<string>('')

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) {
    return (
      <div className="py-3 px-5 rounded-2xl bg-white/5 border border-slate-200/5 dark:border-slate-800/5 w-[180px] h-[48px] animate-pulse shrink-0" />
    )
  }

  return (
    <div className="py-2.5 px-5 rounded-2xl glass-panel border border-slate-300 dark:border-slate-800/20 flex items-center gap-3 shadow-sm text-sm font-bold text-foreground animate-fade-in shrink-0">
      <Clock className="w-5 h-5 text-primary shrink-0" />
      <div className="flex flex-col items-start leading-tight gap-0.5">
        <span className="text-xs md:text-sm font-black tracking-tight">{time}</span>
        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{date}</span>
      </div>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-1.5" />
    </div>
  )
}
