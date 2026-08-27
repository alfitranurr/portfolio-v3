'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { updateProfileAction } from '@/app/admin/actions'
import { 
  User, 
  Terminal, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Globe
} from 'lucide-react'
import { Github, Linkedin, Instagram } from '@/components/icons'
import { cn } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { motion, AnimatePresence } from 'framer-motion'

interface Profile {
  name: string
  headline: string
  about_me: string | null
  avatar_url: string | null
  resume_url: string | null
  logo_url?: string | null
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  skills_title?: string | null
  skills_subtitle?: string | null
}

interface ProfileFormProps {
  initialProfile: Profile
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)
  const [showNotification, setShowNotification] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initialProfile.avatar_url)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(initialProfile.logo_url || null)
  const [resumeName, setResumeName] = React.useState<string | null>(
    initialProfile.resume_url ? 'Current Resume Document' : null
  )

  React.useEffect(() => {
    if (state) {
      const showTimer = setTimeout(() => {
        setShowNotification(true)
      }, 0)
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 5000)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(timer)
      }
    }
  }, [state])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeName(file.name)
    }
  }

  return (
    <form action={formAction} className="space-y-8 animate-fade-in">
      {/* Header Glass Card Container */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Profile Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-0.5">
            Customize your personal biography, headlines, social links, and downloadable CV documents.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto z-10">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Profile Config</span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && state && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className={cn(
              "p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border",
              state.success 
                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            )}
          >
            {state.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{state.success ? state.message : state.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Fields for current urls to pass them back if not changed */}
      <input type="hidden" name="avatar_url" value={initialProfile.avatar_url || ''} />
      <input type="hidden" name="resume_url" value={initialProfile.resume_url || ''} />
      <input type="hidden" name="logo_url" value={initialProfile.logo_url || ''} />
      <input type="hidden" name="skills_title" value={initialProfile.skills_title || ''} />
      <input type="hidden" name="skills_subtitle" value={initialProfile.skills_subtitle || ''} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Bio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Box */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Identity Details</h2>
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={initialProfile.name}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Professional Headline <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  name="headline"
                  required
                  defaultValue={initialProfile.headline}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                About Me Biography
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/60" />
                <textarea
                  name="about_me"
                  rows={10}
                  defaultValue={initialProfile.about_me || ''}
                  placeholder="Tell visitors about your professional history and strengths..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y shadow-2xs"
                />
              </div>
            </div>

          </div>

          {/* Social Presence Box */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Social Networks</h2>
            
            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Instagram URL
              </label>
              <div className="relative">
                <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500/70" />
                <input
                  type="url"
                  name="instagram_url"
                  defaultValue={initialProfile.instagram_url || ''}
                  placeholder="https://instagram.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/70" />
                <input
                  type="url"
                  name="linkedin_url"
                  defaultValue={initialProfile.linkedin_url || ''}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                GitHub Username / Profile URL
              </label>
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <input
                  type="url"
                  name="github_url"
                  defaultValue={initialProfile.github_url || ''}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Files & Uploads */}
        <div className="space-y-6">
          {/* Logo box */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-4 flex flex-col items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary w-full text-left">Website Logo / Favicon</h2>
            
            {/* Square Preview */}
            <div className="relative group w-32 h-32 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800/20 bg-white/60 dark:bg-slate-200/5 flex items-center justify-center shadow-2xs">
              {logoPreview ? (
                <BlurImage
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <Globe className="w-12 h-12 text-muted-foreground/40" />
              )}
            </div>

            <label className="w-full py-2.5 px-4 rounded-xl bg-white/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800/30 text-xs font-bold text-center cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-2xs">
              <UploadCloud className="w-4 h-4 text-muted-foreground" />
              <span>Select Logo Image</span>
              <input
                type="file"
                name="logo_file"
                accept="image/*,.ico"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-muted-foreground text-center">
              PNG, ICO, SVG, or JPG. Recommend square resolution.
            </p>
          </div>

          {/* Avatar box */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-4 flex flex-col items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary w-full text-left">Avatar Picture</h2>
            
            {/* Circle Preview */}
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800/20 bg-white/60 dark:bg-slate-200/5 flex items-center justify-center shadow-2xs">
              {avatarPreview ? (
                <BlurImage
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground/40" />
              )}
            </div>

            <label className="w-full py-2.5 px-4 rounded-xl bg-white/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800/30 text-xs font-bold text-center cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-2xs">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span>Select Profile Image</span>
              <input
                type="file"
                name="avatar_file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-muted-foreground text-center">
              PNG, JPG, or WebP. Recommend square resolution.
            </p>
          </div>

          {/* Resume box */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-300 dark:border-slate-800/20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Resume Document</h2>
            
            {resumeName ? (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-300 dark:border-slate-800/20 flex items-center gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-foreground">{resumeName}</p>
                  {initialProfile.resume_url && (
                    <a
                      href={initialProfile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline font-semibold block mt-0.5"
                    >
                      View Live PDF Document
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800/30 text-center text-xs text-muted-foreground bg-white/40 dark:bg-white/5">
                No resume document currently uploaded.
              </div>
            )}

            <label className="w-full py-2.5 px-4 rounded-xl bg-white/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-800/30 text-xs font-bold text-center cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-2xs">
              <UploadCloud className="w-4 h-4 text-muted-foreground" />
              <span>Upload PDF Document</span>
              <input
                type="file"
                name="resume_file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-muted-foreground text-center">
              Only PDF format documents are supported. Max 5MB file sizes.
            </p>
          </div>

        </div>
      </div>
    </form>
  )
}
