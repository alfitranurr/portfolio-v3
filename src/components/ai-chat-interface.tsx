'use client'

import * as React from 'react'
import { Send, Bot, User, Sparkles, RefreshCw, Trash2, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  'Siapa Al Fitra Nur Ramadhani?',
  'Proyek apa saja yang pernah dibuat?',
  'Skills dan tech stack apa yang dikuasai?',
  'Bagaimana latar belakang pendidikannya?',
  'Pengalaman kerja apa yang dimiliki?',
  'Sertifikat dan penghargaan apa saja?',
]

export function AIChatInterface() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [isHistoryLoaded, setIsHistoryLoaded] = React.useState(false)

  // Load chat history from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alfitra_ai_chat_history')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const loaded = parsed.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
            setMessages(loaded)
          }
        } catch (e) {
          console.error('Error loading chat history:', e)
        }
      }
      setIsHistoryLoaded(true)
    }
  }, [])

  // Save chat history to localStorage when messages change
  React.useEffect(() => {
    if (typeof window !== 'undefined' && isHistoryLoaded) {
      localStorage.setItem('alfitra_ai_chat_history', JSON.stringify(messages))
    }
  }, [messages, isHistoryLoaded])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Lock outer page scroll — only chat area should scroll
  React.useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Create placeholder for assistant response
    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

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
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Read streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        const currentText = accumulated
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: currentText } : m))
        )
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `⚠️ **Error**: ${err.message || 'Gagal terhubung ke AI. Coba lagi nanti.'}`,
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

  if (!isHistoryLoaded) {
    return (
      <div className="flex flex-col h-full items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/20 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Al Fitra AI Assistant</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Powered by Gemini + Google Search</span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all cursor-pointer"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          {isEmptyState ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center min-h-full py-4 text-center px-4"
            >
              <div className="my-auto flex flex-col items-center w-full">
                {/* Animated AI icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center mb-4 shrink-0"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>

                <h3 className="text-lg md:text-xl font-black text-foreground mb-6 shrink-0">
                  Tanya apa saja tentang Al Fitra
                </h3>

                {/* Suggested Questions */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg shrink-0">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl glass-card border border-slate-200/10 dark:border-slate-700/30 text-foreground/80 hover:text-primary hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div key="messages-list" className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {/* AI Avatar */}
                  {message.role === 'assistant' && (
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/10 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20'
                        : 'glass-panel rounded-bl-md'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      message.content ? (
                        <div className="chat-markdown prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="typing-indicator">
                            <span />
                            <span />
                            <span />
                          </div>
                          <span className="text-xs text-muted-foreground">Memikirkan jawaban...</span>
                        </div>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 flex items-center justify-center shadow-md mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-slate-200/10 dark:border-slate-800/20 mt-2 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 p-2 rounded-2xl glass-panel border border-slate-200/20 dark:border-slate-700/30 focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan tentang Al Fitra..."
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none px-3 py-2.5 max-h-[150px] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={cn(
                'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer',
                input.trim() && !isStreaming
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95'
                  : 'bg-slate-200/20 dark:bg-slate-800/30 text-muted-foreground cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              {isStreaming ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
            AI dapat membuat kesalahan. Respon didasarkan pada data portfolio + web search.
          </p>
        </form>
      </div>
    </div>
  )
}
