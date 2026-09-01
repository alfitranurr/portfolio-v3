import * as React from 'react'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Certificate, CATEGORY_MAP } from './types'

interface CertificateFormProps {
  certificate: Partial<Certificate> | null
  onCancel: () => void
  onSave: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdateCertificate: (updater: (prev: Partial<Certificate> | null) => Partial<Certificate> | null) => void
  isPending: boolean
}

export function CertificateForm({
  certificate,
  onCancel,
  onSave,
  onUpdateCertificate,
  isPending
}: CertificateFormProps) {
  if (!certificate) return null

  return (
    <div className="rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Listing</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-wider text-primary">
          {certificate.id ? 'Edit Certificate' : 'Add New Certificate'}
        </h2>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Certificate Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={certificate.title || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Issuer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Issuing Organization <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={certificate.issuer || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="e.g. Amazon Web Services"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <select
                value={certificate.category || 'license_certification'}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, category: e.target.value as Certificate['category'] }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
              >
                {Object.entries(CATEGORY_MAP).filter(([key]) => key !== 'All').map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Issue Date <span className="text-primary">*</span>
              </label>
              <input
                type="date"
                required
                value={certificate.issue_date || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, issue_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Credential ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Credential ID
              </label>
              <input
                type="text"
                value={certificate.credential_id || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, credential_id: e.target.value }))}
                placeholder="e.g. ABC123XYZ"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Credential URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Credential URL
              </label>
              <input
                type="url"
                value={certificate.credential_url || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, credential_url: e.target.value }))}
                placeholder="https://verify.example.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Certificate Image URL
              </label>
              <input
                type="url"
                value={certificate.image_url || ''}
                onChange={e => onUpdateCertificate(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/certificate.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-slate-700/50 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Optional: URL to certificate image or badge
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-5 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/10"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Certificate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
