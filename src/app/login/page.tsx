'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { loginAction } from './actions'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null)

  const state = loginState
  const isPending = isLoginPending

  const message = state && 'message' in state ? (state.message as string) : undefined
  const error = state && 'error' in state ? (state.error as string) : undefined

  // Route redirection on success
  React.useEffect(() => {
    if (state && 'redirect' in state && state.success && state.redirect) {
      router.push(state.redirect)
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center py-10 px-4">
      {/* Main glass box */}
      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full filter blur-2xl pointer-events-none" />

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">Admin Gatekeeper</h1>
          <p className="text-xs text-muted-foreground">
            Access the portfolio command center
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form action={loginFormAction} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="email"
                name="email"
                required
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
