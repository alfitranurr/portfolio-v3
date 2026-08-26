/* cspell:disable */
'use client'

import * as React from 'react'
import { Send, Bot, User, Sparkles, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  {
    icon: '👤',
    title: 'Tentang Al Fitra',
    prompt: 'Siapa Al Fitra Nur Ramadhani dan apa fokus keahliannya?',
  },
  {
    icon: '🚀',
    title: 'Proyek Portofolio',
    prompt: 'Proyek apa saja yang pernah dibuat oleh Al Fitra?',
  },
  {
    icon: '⚡',
    title: 'Tech Stack & Skill',
    prompt: 'Skills, bahasa pemrograman, dan tools apa yang dikuasai?',
  },
  {
    icon: '💼',
    title: 'Pengalaman Kerja',
    prompt: 'Pengalaman kerja dan organisasi apa yang dimiliki?',
  },
  {
    icon: '🎓',
    title: 'Pendidikan',
    prompt: 'Bagaimana riwayat dan latar belakang pendidikan Al Fitra?',
  },
  {
    icon: '🏆',
    title: 'Sertifikasi',
    prompt: 'Sertifikat kompetensi dan penghargaan apa saja yang diraih?',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
}

function generateId(prefix: 'user' | 'assistant'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}

function getCurrentTimestamp(): Date {
  return new Date()
}

export function AIChatInterface() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isHistoryLoaded, setIsHistoryLoaded] = React.useState(false)

  // Load chat history from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alfitra_ai_chat_history')
      let loaded: ChatMessage[] = []
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            loaded = parsed.map((m: ChatMessage) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          }
        } catch (e) {
          console.error('Error loading chat history:', e)
        }
      }
      queueMicrotask(() => {
        if (loaded.length > 0) {
          setMessages(loaded)
        }
        setIsHistoryLoaded(true)
      })
    }
  }, [])

  // Save chat history to localStorage when messages change
  React.useEffect(() => {
    if (typeof window !== 'undefined' && isHistoryLoaded) {
      localStorage.setItem('alfitra_ai_chat_history', JSON.stringify(messages))
    }
  }, [messages, isHistoryLoaded])

  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)
  const prevMessagesLength = React.useRef(0)

  // Ensure the page viewport always stays at the top on initial load
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Auto-scroll ONLY inside the chat container when new messages are added
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      })
    }
  }, [])

  React.useEffect(() => {
    if (messages.length > 0 && messages.length !== prevMessagesLength.current) {
      scrollToBottom(prevMessagesLength.current === 0 ? 'auto' : 'smooth')
      prevMessagesLength.current = messages.length
    }
  }, [messages, scrollToBottom])


  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: content.trim(),
      timestamp: getCurrentTimestamp(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    const assistantId = generateId('assistant')
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: getCurrentTimestamp(),
    }

    setMessages([...updatedMessages, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get response`)
      }

      if (!response.body) {
        throw new Error('No response stream available')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        if (chunk) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          )
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
          }
        }
      }
    } catch (error) {
      console.error('Chat stream error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `⚠️ **Error**: ${errorMessage}`,
              }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const isEmptyState = messages.length === 0

  return (
    <div className="flex flex-col h-full w-full border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl bg-card/30 dark:bg-slate-900/40 backdrop-blur-sm p-2.5 sm:p-4 shadow-sm overflow-hidden">
      {/* Chat Room Header Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            AI Chat Session Active
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all cursor-pointer font-semibold"
            title="Clear chat"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 scroll-smooth min-h-0"
      >
        {!isHistoryLoaded ? (
          <div className="flex flex-col h-full items-center justify-center min-h-[200px]">
            <RefreshCw className="w-5 h-5 animate-spin text-primary/50" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center min-h-full py-2 sm:py-4 text-center px-1 sm:px-4 transform-gpu"
              >
                <div className="my-auto flex flex-col items-center w-full max-w-xl">
                  {/* Animated AI Sparkles icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center mb-2.5 sm:mb-4 shrink-0 shadow-inner transform-gpu"
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>

                  <h3 className="text-sm sm:text-base md:text-lg font-black text-foreground mb-1">
                    Tanya apa saja tentang Al Fitra
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground/80 mb-3 sm:mb-4 max-w-sm">
                    Pilih topik di bawah ini atau ketik pertanyaan langsung di kolom chat
                  </p>

                  {/* Modern 2-Column Responsive Suggested Prompts Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-1.5 sm:gap-2.5 w-full text-left"
                  >
                    {SUGGESTIONS.map((item, i) => (
                      <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() => sendMessage(item.prompt)}
                        className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass-card border border-slate-200/70 dark:border-slate-800/70 hover:border-primary/40 bg-white/5 dark:bg-slate-800/30 text-left transition-all group cursor-pointer active:scale-[0.97] flex flex-col justify-between gap-1 shadow-2xs hover:shadow-md hover:shadow-primary/5 transform-gpu"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs sm:text-sm shrink-0">{item.icon}</span>
                            <span className="font-bold text-[11px] sm:text-xs text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                              {item.title}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 hidden sm:block" />
                        </div>
                        <p className="text-[9.5px] sm:text-[11px] text-muted-foreground/80 line-clamp-1 leading-tight">
                          {item.prompt}
                        </p>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div key="messages-list" className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'flex gap-2 sm:gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* AI Avatar */}
                    {message.role === 'assistant' && (
                      <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-xs mt-0.5">
                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'max-w-[88%] sm:max-w-[78%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-xs shadow-primary/10'
                          : 'glass-panel rounded-bl-xs border border-slate-200/70 dark:border-slate-800/70'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        message.content ? (
                          <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 py-1">
                            <div className="typing-indicator">
                              <span />
                              <span />
                              <span />
                            </div>
                            <span className="text-xs text-muted-foreground">Mengetik jawaban...</span>
                          </div>
                        )
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-700 dark:bg-slate-600 flex items-center justify-center shadow-xs mt-0.5">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-2 sm:pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-1 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-1.5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl glass-panel border border-slate-200/70 dark:border-slate-700/50 focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/5 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan tentang Al Fitra..."
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none px-2 py-1.5 sm:px-3 sm:py-2 max-h-[100px] sm:max-h-[120px] disabled:opacity-50 leading-normal"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={cn(
                'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all cursor-pointer',
                input.trim() && !isStreaming
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95'
                  : 'bg-slate-200/30 dark:bg-slate-800/30 text-muted-foreground/50 cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              {isStreaming ? (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
          <p className="text-[8.5px] sm:text-[10px] text-muted-foreground/60 text-center mt-1 truncate">
            AI dapat membuat kesalahan. Respon didasarkan pada data portfolio + web search.
          </p>
        </form>
      </div>
    </div>
  )
}
