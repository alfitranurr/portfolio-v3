'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { loginAction, signupAction } from './actions'
import { useRouter } from 'next/navigation'
import { Terminal, Shield, Lock, Mail, User, Info, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = React.useState(true)

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, null)
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, null)

  const state = isLogin ? loginState : signupState
  const isPending = isLogin ? isLoginPending : isSignupPending

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
      {/* Back button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Portfolio</span>
      </Link>

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
            {isLogin 
              ? "Access the portfolio command center" 
              : "Set up the initial administrator profile"
            }
          </p>
        </div>

        {/* Sign In vs Setup tabs */}
        <div className="flex p-1 rounded-xl bg-slate-200/15 dark:bg-slate-800/20 border border-slate-200/5">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              isLogin ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/75 hover:text-foreground"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
              !isLogin ? "bg-primary text-primary-foreground shadow-md" : "text-foreground/75 hover:text-foreground"
            )}
          >
            Setup Admin
          </button>
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
        <form action={isLogin ? loginFormAction : signupFormAction} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Al Fitra Nur Ramadhani"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Headline
                </label>
                <div className="relative">
                  <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    name="headline"
                    placeholder="Data Scientist & Developer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </>
          )}

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
              <span>{isLogin ? "Sign In to Dashboard" : "Register Admin"}</span>
            )}
          </button>
        </form>

        {/* Local Dev box */}
        <div className="p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground block mb-0.5">Local Development Tip:</span>
            If you haven&apos;t set up Supabase variables in your `.env.local` yet, use username <span className="font-bold text-foreground">admin@example.com</span> and password <span className="font-bold text-foreground">admin123</span> to bypass and enter the admin dashboard.
          </div>
        </div>
      </div>
    </div>
  )
}
