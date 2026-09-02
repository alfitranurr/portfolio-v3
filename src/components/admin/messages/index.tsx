'use client'

import * as React from 'react'
import { RefreshCw, Inbox, AlertCircle, Mail, MailOpen, Search, Trash2, ChevronDown, RotateCcw, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message, MessagesListProps, VisitorStatsProps } from './types'
import { RealTimeClock } from './RealTimeClock'
import { MonthlyTrafficChart } from '@/components/admin/monthly-traffic-chart'
import { useRouter } from 'next/navigation'
import { toggleMessageReadAction, deleteMessageAction, getVisitorStatsAction, revalidatePublicPagesAction, resetVisitorAnalyticsAction } from '@/app/admin/actions'

function HeaderActions({ onRefresh }: { onRefresh: () => void }) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)
  const [resetNotice, setResetNotice] = React.useState<{ success: boolean; message: string } | null>(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const handleResetCache = async () => {
    if (!confirm('Reset public page cache? Visitor view will immediately reflect the latest database data.')) {
      return
    }
    setIsResetting(true)
    setResetNotice(null)
    try {
      const res = await revalidatePublicPagesAction()
      setResetNotice({ success: res.success, message: res.success ? (res.message || 'Cache reset.') : (res.error || 'Failed to reset cache.') })
    } catch (err) {
      console.error(err)
      setResetNotice({ success: false, message: 'Error resetting cache.' })
    } finally {
      setIsResetting(false)
      setTimeout(() => setResetNotice(null), 4000)
    }
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      {resetNotice && (
        <span
          className={cn(
            "text-[10px] font-bold px-2.5 py-1.5 rounded-lg border",
            resetNotice.success
              ? "text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/10"
              : "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10"
          )}
        >
          {resetNotice.message}
        </span>
      )}
      <button
        onClick={handleResetCache}
        disabled={isResetting}
        title="Reset public page cache (force visitor view to refresh)"
        className="px-3 py-3 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-50"
      >
        <RotateCcw className={cn("w-5 h-5", isResetting && "animate-spin")} />
        <span className="text-xs font-bold hidden sm:inline">Reset Cache</span>
      </button>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        title="Refresh data"
        className="p-3 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
      >
        <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
      </button>
      <RealTimeClock />
    </div>
  )
}

function VisitorStats({ visitorStats, onReset, isResetting }: VisitorStatsProps) {
  if (!visitorStats) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={onReset}
          disabled={isResetting}
          title="Reset visitor analytics (set all stats to 0)"
          className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <Trash className={cn("w-3.5 h-3.5", isResetting && "animate-pulse")} />
          <span>{isResetting ? 'Resetting...' : 'Reset Stats'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-2">
        <div className="text-2xl font-black text-primary">{visitorStats.totalViews.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground font-semibold">Total Views</p>
      </div>
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-2">
        <div className="text-2xl font-black text-primary">{visitorStats.uniqueVisitors.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground font-semibold">Unique Visitors</p>
      </div>
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-2">
        <div className="text-2xl font-black text-primary">{visitorStats.todayViews.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground font-semibold">{"Today's Views"}</p>
      </div>
      <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-2">
        <div className="text-2xl font-black text-primary">{visitorStats.todayUnique.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground font-semibold">{"Today's Unique"}</p>
      </div>
      </div>
    </div>
  )
}

export function MessagesList({ initialMessages, stats, visitorStats }: MessagesListProps) {
  const [prevInitialMessages, setPrevInitialMessages] = React.useState(initialMessages)
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages)
    setMessages(initialMessages)
  }

  const [prevVisitorStats, setPrevVisitorStats] = React.useState(visitorStats)
  const [currentVisitorStats, setCurrentVisitorStats] = React.useState(visitorStats)
  if (visitorStats !== prevVisitorStats) {
    setPrevVisitorStats(visitorStats)
    setCurrentVisitorStats(visitorStats)
  }

  const [search, setSearch] = React.useState('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)
  const [isResettingStats, setIsResettingStats] = React.useState(false)
  const router = useRouter()

  const handleRefreshData = () => {
    router.refresh()
    setRefreshTrigger(prev => prev + 1)
    getVisitorStatsAction().then(res => {
      if (res.success && res.data) {
        setCurrentVisitorStats(res.data)
      }
    }).catch(err => {
      console.warn('Failed to refresh visitor stats:', err)
    })
  }

  const handleResetStats = async () => {
    if (!confirm('Reset ALL visitor analytics? This will permanently delete all page view records and set stats to 0. This cannot be undone.')) {
      return
    }
    setIsResettingStats(true)
    try {
      const res = await resetVisitorAnalyticsAction()
      if (res.success) {
        setCurrentVisitorStats({
          totalViews: 0,
          uniqueVisitors: 0,
          todayViews: 0,
          todayUnique: 0,
          isMissingTable: currentVisitorStats?.isMissingTable
        })
        setRefreshTrigger(prev => prev + 1)
      } else {
        alert(res.error || 'Failed to reset stats.')
      }
    } catch (err) {
      console.error(err)
      alert('Error resetting stats.')
    } finally {
      setIsResettingStats(false)
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  const filteredMessages = React.useMemo(() => {
    const term = search.toLowerCase()
    return messages.filter(m => {
      return (
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.subject || '').toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term)
      )
    })
  }, [messages, search])

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    setIsUpdating(id)
    try {
      const nextStatus = !currentStatus
      const res = await toggleMessageReadAction(id, nextStatus)
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: nextStatus } : m))
      } else {
        alert('Failed to update status.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this message permanently?')) {
      setIsUpdating(id)
      try {
        const res = await deleteMessageAction(id)
        if (res.success) {
          setMessages(prev => prev.filter(m => m.id !== id))
          if (expandedId === id) setExpandedId(null)
        } else {
          alert('Failed to delete message.')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsUpdating(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Dashboard & Messages
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Monitor incoming contact form inquiries, visitor traffic analytics, and portfolio metrics in real-time.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-center z-10">
          <HeaderActions onRefresh={handleRefreshData} />
        </div>
      </div>

      {/* Missing Database Table Alert */}
      {currentVisitorStats?.isMissingTable && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs md:text-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Visitor Analytics Feature Not Active</span>
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            The database table <code>page_views</code> or the aggregation function <code>get_visitor_analytics</code> has not been initialized.
          </p>
        </div>
      )}

      {/* Visitor Stats */}
      {currentVisitorStats && !currentVisitorStats.isMissingTable && (
        <VisitorStats visitorStats={currentVisitorStats} onReset={handleResetStats} isResetting={isResettingStats} />
      )}

      {/* Monthly Traffic Chart */}
      {currentVisitorStats && !currentVisitorStats.isMissingTable && (
        <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-4 md:p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">
            Monthly Traffic Overview
          </h3>
          <MonthlyTrafficChart key={refreshTrigger} />
        </div>
      )}

      {/* Portfolio Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-center space-y-2">
          <div className="text-2xl font-black text-primary">{stats.projects}</div>
          <p className="text-xs text-muted-foreground font-semibold">Projects</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-center space-y-2">
          <div className="text-2xl font-black text-primary">{stats.experience}</div>
          <p className="text-xs text-muted-foreground font-semibold">Experiences</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-center space-y-2">
          <div className="text-2xl font-black text-primary">{stats.education}</div>
          <p className="text-xs text-muted-foreground font-semibold">Educations</p>
        </div>
        <div className="p-6 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 text-center space-y-2">
          <div className="text-2xl font-black text-primary">{stats.certificates}</div>
          <p className="text-xs text-muted-foreground font-semibold">Certificates</p>
        </div>
      </div>

      {/* Messages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-foreground">
              Inbox Messages ({filteredMessages.length})
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 glass-panel space-y-3">
            <MailOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <h3 className="font-extrabold text-foreground text-base">No messages found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search ? 'No messages match your search.' : 'Your inbox is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "rounded-2xl border transition-all duration-200",
                  msg.is_read
                    ? "glass-panel border-slate-200/10 dark:border-slate-800/10 bg-white/2 dark:bg-slate-900/20"
                    : "glass-panel border-slate-200/30 dark:border-slate-800/30 bg-white/5 dark:bg-slate-900/30"
                )}
              >
                <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("font-bold text-xs", !msg.is_read && "text-foreground")}>
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {msg.email}
                          </span>
                          {msg.is_read === null && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Pending read status" />
                          )}
                        </div>
                        {msg.subject && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title={msg.subject}>
                            {msg.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatDate(msg.created_at)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleRead(msg.id, msg.is_read || false) }}
                        disabled={isUpdating === msg.id}
                        title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                        className={cn(
                          "p-1.5 rounded-lg transition-all cursor-pointer",
                          msg.is_read
                            ? "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                            : "bg-primary/10 hover:bg-primary/20 text-primary"
                        )}
                      >
                        {msg.is_read ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      </button>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === msg.id && "rotate-180")} />
                    </div>
                  </div>

                  {expandedId === msg.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200/5 dark:border-slate-800/5 space-y-4">
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg.id) }}
                          disabled={isUpdating === msg.id}
                          className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 cursor-pointer border border-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
