'use client'

import * as React from 'react'
import { 
  Mail, 
  MailOpen, 
  Trash2, 
  Search, 
  Clock, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Inbox,
  AlertCircle,
  Coffee,
  GraduationCap,
  Briefcase,
  Award,
  Eye,
  Users
} from 'lucide-react'
import { toggleMessageReadAction, deleteMessageAction } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean | null
  created_at: string
}

interface MessagesListProps {
  initialMessages: Message[]
  stats: {
    projects: number
    education: number
    experience: number
    certificates: number
  }
  visitorStats?: {
    totalViews: number
    uniqueVisitors: number
    todayViews: number
    todayUnique: number
    isMissingTable?: boolean
  }
}

export function MessagesList({ initialMessages, stats, visitorStats }: MessagesListProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [search, setSearch] = React.useState('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Count unread
  const unreadCount = messages.filter(m => !m.is_read).length

  // Filter messages
  const filteredMessages = messages.filter(m => {
    const term = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.subject || '').toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term)
    )
  })

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor contact inquiries and portfolio statistics in real-time.
        </p>
      </div>

      {/* Missing Database Table Alert */}
      {visitorStats?.isMissingTable && (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs md:text-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Fitur Analisis Pengunjung Belum Aktif</span>
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            Tabel database <code>page_views</code> tidak ditemukan. Untuk mengaktifkan pelacakan pengunjung dan pengunjung unik, silakan buka SQL Editor di dashboard Supabase Anda, lalu salin dan jalankan perintah berikut:
          </p>
          <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-amber-300 font-mono overflow-x-auto text-[11px] whitespace-pre select-all">
{`CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin select on page_views" ON public.page_views FOR SELECT USING (auth.role() = 'authenticated');`}
          </pre>
          <p className="text-[11px] text-amber-200/60 italic font-medium">
            *Catatan: Setelah menjalankan skrip di atas, silakan muat ulang halaman ini.
          </p>
        </div>
      )}

      {/* Row 1: Traffic & Inbox Stats */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Engagement & Traffic</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Views Card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Views</span>
              <div className="p-2 rounded-xl bg-white/5 text-primary">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{visitorStats?.totalViews ?? 0}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Page hits recorded</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1">
                +{visitorStats?.todayViews ?? 0} today
              </span>
            </div>
          </div>

          {/* Unique Visitors Card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unique Visitors</span>
              <div className="p-2 rounded-xl bg-white/5 text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{visitorStats?.uniqueVisitors ?? 0}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Distinct user sessions</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold flex items-center gap-1">
                +{visitorStats?.todayUnique ?? 0} today
              </span>
            </div>
          </div>

          {/* Messages inbox card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between relative overflow-hidden group">
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full filter blur-xl group-hover:bg-primary/20 transition-all" />
            )}
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inbox</span>
              <div className={cn(
                "p-2 rounded-xl text-primary",
                unreadCount > 0 ? "bg-primary/15 animate-pulse" : "bg-white/5"
              )}>
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{unreadCount}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Unread messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Portfolio Content Stats */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Portfolio Content</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Projects card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projects</span>
              <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                <Coffee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{stats.projects}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Showcase works</p>
            </div>
          </div>

          {/* Education card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Education</span>
              <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{stats.education}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Timeline milestones</p>
            </div>
          </div>

          {/* Experience card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Experiences</span>
              <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{stats.experience}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Work history roles</p>
            </div>
          </div>

          {/* Certificates card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Certificates</span>
              <div className="p-2 rounded-xl bg-white/5 text-muted-foreground">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{stats.certificates}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Credentials issued</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Viewer Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <h2 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Messages Inbox ({filteredMessages.length})</span>
          </h2>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search sender, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* List of messages */}
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200/10 dark:border-slate-800/10 bg-white/5 dark:bg-white/5 space-y-3">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-extrabold text-foreground">No messages found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your inbox is clean! Visitors can send inquiries through the public Get In Touch page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => {
              const isExpanded = expandedId === msg.id
              const isMsgRead = !!msg.is_read
              const isPending = isUpdating === msg.id

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 relative overflow-hidden",
                    isMsgRead 
                      ? "bg-white/5 border-slate-200/5 dark:border-slate-800/5 hover:border-slate-200/10 dark:hover:border-slate-800/10" 
                      : "bg-primary/5 border-primary/10 hover:border-primary/20 shadow-md shadow-primary/5",
                    isExpanded ? "border-primary/30" : ""
                  )}
                >
                  {/* Summary row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dot for unread */}
                        {!isMsgRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        )}
                        <h4 className="font-black text-sm text-foreground truncate">{msg.name}</h4>
                        <span className="text-[10px] text-muted-foreground truncate">({msg.email})</span>
                      </div>
                      <p className="font-extrabold text-xs text-foreground/80 truncate">
                        {msg.subject || 'No Subject'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Timestamp */}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                      </span>

                      {/* Expand Chevron */}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Body details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-200/10 dark:border-slate-800/10 space-y-4 animate-slide-up">
                      <div className="p-4 rounded-xl bg-white/5 dark:bg-black/10 border border-slate-200/5 text-xs md:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRead(msg.id, isMsgRead)}
                            disabled={isPending}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer border",
                              isMsgRead
                                ? "bg-white/5 hover:bg-white/10 text-foreground border-slate-200/10 dark:border-slate-800/10"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-md shadow-primary/10"
                            )}
                          >
                            {isMsgRead ? (
                              <>
                                <Mail className="w-3.5 h-3.5" />
                                <span>Mark Unread</span>
                              </>
                            ) : (
                              <>
                                <MailOpen className="w-3.5 h-3.5" />
                                <span>Mark Read</span>
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Message</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
