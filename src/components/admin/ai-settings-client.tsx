'use client'

import * as React from 'react'
import { 
  Bot, 
  Settings, 
  Trash2, 
  Clock, 
  Search, 
  Cpu, 
  Sliders, 
  Coins, 
  Activity, 
  Database,
  CheckCircle,
  AlertTriangle,
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info
} from 'lucide-react'
import { saveAISettingsAction, clearAIChatLogsAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'
import { AISettings, AIChatLog } from '@/lib/ai-service'

interface AISettingsClientProps {
  initialSettings: AISettings
  initialLogs: AIChatLog[]
}

export function AISettingsClient({ initialSettings, initialLogs }: AISettingsClientProps) {
  const [settings, setSettings] = React.useState<AISettings>(initialSettings)
  const [logs, setLogs] = React.useState<AIChatLog[]>(initialLogs)
  
  // Form states
  const [modelName, setModelName] = React.useState(initialSettings.model_name)
  const [searchGrounding, setSearchGrounding] = React.useState(initialSettings.search_grounding)
  const [temperature, setTemperature] = React.useState(initialSettings.temperature)
  const [maxHistory, setMaxHistory] = React.useState(initialSettings.max_history)
  
  // UI states
  const [isSaving, setIsSaving] = React.useState(false)
  const [isClearing, setIsClearing] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // Search & pagination states
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null)
  
  const logsPerPage = 10

  // Calculate statistics
  const totalQueries = logs.length
  const totalPromptTokens = logs.reduce((sum, l) => sum + (l.prompt_tokens || 0), 0)
  const totalCompletionTokens = logs.reduce((sum, l) => sum + (l.completion_tokens || 0), 0)
  const totalTokens = totalPromptTokens + totalCompletionTokens
  const groundingCount = logs.filter(l => l.search_grounding).length
  const groundingPercentage = totalQueries > 0 ? Math.round((groundingCount / totalQueries) * 100) : 0

  // Standard pricing calculation based on Gemini's pricing rates
  const estimatedCost = React.useMemo(() => {
    return logs.reduce((total, log) => {
      const isPro = log.model_name.includes('pro')
      // Gemini 2.5 Flash: Input $0.075 / 1M, Output $0.30 / 1M
      // Gemini 2.5 Pro: Input $1.25 / 1M, Output $5.00 / 1M
      const inputRate = isPro ? 1.25 : 0.075
      const outputRate = isPro ? 5.00 : 0.30
      
      const inputCost = ((log.prompt_tokens || 0) / 1_000_000) * inputRate
      const outputCost = ((log.completion_tokens || 0) / 1_000_000) * outputRate
      
      return total + inputCost + outputCost
    }, 0)
  }, [logs])

  // Filtered logs
  const filteredLogs = React.useMemo(() => {
    if (!searchQuery.trim()) return logs
    const term = searchQuery.toLowerCase()
    return logs.filter(l => 
      l.prompt_preview.toLowerCase().includes(term) ||
      l.model_name.toLowerCase().includes(term) ||
      l.user_ip.toLowerCase().includes(term)
    )
  }, [logs, searchQuery])

  // Paginated logs
  const paginatedLogs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage
    return filteredLogs.slice(startIndex, startIndex + logsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Clear notification feedback after 4 seconds
  React.useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFeedback(null)
    
    try {
      const updatedSettings: AISettings = {
        model_name: modelName,
        search_grounding: searchGrounding,
        temperature: Number(temperature),
        max_history: Number(maxHistory)
      }
      
      const res = await saveAISettingsAction(updatedSettings)
      if (res.success) {
        setSettings(updatedSettings)
        setFeedback({ type: 'success', message: 'AI configuration updated successfully!' })
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to save configuration.' })
      }
    } catch (err: any) {
      console.error(err)
      setFeedback({ type: 'error', message: 'An unexpected error occurred while saving.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to permanently clear all AI chat logs? This cannot be undone.')) {
      setIsClearing(true)
      try {
        const res = await clearAIChatLogsAction()
        if (res.success) {
          setLogs([])
          setFeedback({ type: 'success', message: 'Token usage audit logs cleared successfully!' })
        } else {
          alert('Failed to clear logs: ' + (res.error || 'Unknown error'))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsClearing(false)
      }
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Bot className="w-8 h-8 text-primary" />
            <span>AI Chat Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure backend model parameters and audit API token usage.
          </p>
        </div>
        
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            disabled={isClearing}
            className="self-start sm:self-auto px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-all rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isClearing ? 'Clearing...' : 'Clear Audit Logs'}</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className={cn(
          "p-4 rounded-xl border flex items-center gap-3 animate-slide-up text-xs font-semibold",
          feedback.type === 'success' 
            ? "bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400"
        )}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tokens Used */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full filter blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Tokens</span>
            <div className="p-2 rounded-xl bg-white/5 text-primary">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{totalTokens.toLocaleString()}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {totalPromptTokens.toLocaleString()} input / {totalCompletionTokens.toLocaleString()} output
            </p>
          </div>
        </div>

        {/* Total Requests */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Queries</span>
            <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{totalQueries}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Successful chat generations</p>
          </div>
        </div>

        {/* Search Grounding Rate */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Grounding Search</span>
            <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight">{groundingPercentage}%</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{groundingCount} searches performed</p>
          </div>
        </div>

        {/* Estimated API Cost */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full filter blur-xl" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Cost</span>
            <div className="p-2 rounded-xl bg-white/5 text-green-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-green-500">
              ${estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Calculated from API rates</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Config Form & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6">
            <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2 border-b border-slate-200/10 dark:border-slate-800/10 pb-3">
              <Sliders className="w-5 h-5 text-primary" />
              <span>Model Config</span>
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              
              {/* Model selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Gemini Model</span>
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all cursor-pointer font-medium"
                >
                  <option value="gemini-2.5-flash" className="bg-white dark:bg-slate-950 text-foreground">Gemini 2.5 Flash (Default)</option>
                  <option value="gemini-2.5-pro" className="bg-white dark:bg-slate-950 text-foreground">Gemini 2.5 Pro (Advanced)</option>
                  <option value="gemini-1.5-flash" className="bg-white dark:bg-slate-950 text-foreground">Gemini 1.5 Flash (Legacy)</option>
                </select>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Flash is faster and cheaper, Pro is recommended for deep reasoning over complex projects.
                </p>
              </div>

              {/* Temperature slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Temperature ({temperature})
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {temperature <= 0.3 ? 'Focused/Precise' : temperature >= 0.9 ? 'Creative/Wild' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-primary bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Lower values make outputs more precise. Higher values make them more diverse and creative.
                </p>
              </div>

              {/* Max Chat History Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Max Message History ({maxHistory})
                  </label>
                  <span className="text-[10px] text-muted-foreground">{maxHistory / 2} turns</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="2"
                  value={maxHistory}
                  onChange={(e) => setMaxHistory(Number(e.target.value))}
                  className="w-full accent-primary bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Limit context size sent to Gemini API to save token usage (TPM limits) in conversational chat.
                </p>
              </div>

              {/* Google Search Grounding toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-slate-200/5 hover:border-slate-200/10 dark:hover:border-slate-800/10 transition-all select-none">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>Search Grounding</span>
                  </span>
                  <p className="text-[9px] text-muted-foreground leading-normal">
                    Allows Gemini to pull live web search queries.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchGrounding}
                    onChange={(e) => setSearchGrounding(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/95 shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Usage Logs Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <span>Token Audit Trail ({filteredLogs.length})</span>
            </h2>

            {/* Logs search bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search prompt preview, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Audit Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 dark:bg-white/5 space-y-3">
              <Bot className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-extrabold text-foreground">No logs captured</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No token logging events found. Prompt events will populate here once a user chats with the AI.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedLogs.map((log) => {
                const isExpanded = expandedLogId === log.id
                const isPro = log.model_name.includes('pro')
                
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "rounded-2xl border transition-all duration-300 relative overflow-hidden bg-white/5 border-slate-200/5 dark:border-slate-800/5 hover:border-slate-200/10 dark:hover:border-slate-800/10",
                      isExpanded ? "border-primary/30" : ""
                    )}
                  >
                    {/* Header Summary Row */}
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase",
                            isPro ? "bg-purple-500/15 text-purple-400 border border-purple-500/10" : "bg-primary/15 text-primary border border-primary/10"
                          )}>
                            {log.model_name}
                          </span>
                          
                          {log.search_grounding && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-sky-500/15 text-sky-400 border border-sky-500/10 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Search</span>
                            </span>
                          )}

                          <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-1.5 py-0.5 rounded">
                            {log.total_tokens} Tkn
                          </span>
                        </div>
                        <p className="font-medium text-xs text-foreground/80 truncate mt-1">
                          {log.prompt_preview || 'Empty prompt'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Time stamp */}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </span>
                        
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Detailed Expanded Row */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200/10 dark:border-slate-800/10 space-y-3.5 animate-slide-up text-xs">
                        
                        {/* Full Prompt Preview */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Prompt Excerpt</span>
                          <div className="p-3.5 rounded-xl bg-white/5 border border-slate-200/5 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-mono">
                            {log.prompt_preview}
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl border border-slate-200/5">
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Prompt Tokens</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">{log.prompt_tokens}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Response Tokens</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">{log.completion_tokens}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Grounding Mode</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">{log.search_grounding ? 'Google Search' : 'No Grounding'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Sender IP / Agent</span>
                            <span className="font-extrabold text-foreground mt-0.5 block font-mono truncate">{log.user_ip}</span>
                          </div>
                        </div>

                        {/* Log Metadata Timestamp */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Info className="w-3.5 h-3.5" />
                          <span>Logged on {new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages} ({filteredLogs.length} total logs)
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground disabled:opacity-40 transition-all font-bold cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-1.5 text-xs rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground disabled:opacity-40 transition-all font-bold cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
