'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { submitContactForm } from '@/app/contact/actions'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const formRef = React.useRef<HTMLFormElement>(null)

  // Reset form inputs upon successful submission
  React.useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Success Notification */}
      {state?.success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Error Notification */}
      {state?.success === false && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Name and Email Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Your Name <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Email Address <span className="text-primary">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            placeholder="johndoe@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm transition-all"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          placeholder="Collaboration Inquiry"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm transition-all"
        />
      </div>

      {/* Message Text area */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Message Content <span className="text-primary">*</span>
        </label>
        <textarea
          name="message"
          id="message"
          required
          rows={5}
          placeholder="Hi Al Fitra, I would love to discuss a project..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 text-sm transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all",
          isPending
            ? "bg-primary/70 text-primary-foreground/75 cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/15"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  )
}
