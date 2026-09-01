import * as React from 'react'
import { Eye, Copy, Edit3, Trash2, Calendar, ExternalLink, Award } from 'lucide-react'
import { BlurImage } from '@/components/ui/blur-image'
import { getDirectImageUrl } from '@/lib/utils'
import { Certificate, CATEGORY_MAP } from './types'

interface CertificateTableViewProps {
  certificates: Certificate[]
  startIndex: number
  onPreview: (certificate: Certificate) => void
  onEdit: (certificate: Certificate) => void
  onDuplicate: (certificate: Certificate) => void
  onDelete: (id: string) => void
}

export function CertificateTableView({ certificates, startIndex, onPreview, onEdit, onDuplicate, onDelete }: CertificateTableViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="rounded-2xl glass-panel border border-slate-200/10 dark:border-slate-800/10 overflow-hidden shadow-sm relative z-10 w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-xs table-auto">
          <thead className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/10 dark:border-slate-800/20 uppercase tracking-wider font-extrabold text-[10px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Certificate</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Category</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Issue Date</th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">Credential</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/10 font-medium">
            {certificates.map((cert, index) => (
              <tr 
                key={cert.id}
                className="hover:bg-slate-500/5 transition-colors group"
              >
                <td className="py-2.5 px-3 text-center text-muted-foreground/60 font-mono text-[11px]">
                  {startIndex + index + 1}
                </td>

                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60 shrink-0 relative shadow-xs">
                      {cert.image_url ? (
                        <BlurImage
                          src={getDirectImageUrl(cert.image_url, 150)}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40 bg-primary/5">
                          <Award className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors line-clamp-1" title={cert.title}>
                        {cert.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                        {cert.issuer}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-slate-200/10 dark:border-slate-800/10 text-[10px] font-bold text-muted-foreground">
                    {CATEGORY_MAP[cert.category]}
                  </span>
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-muted-foreground font-mono text-center">
                  {formatDate(cert.issue_date)}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-center">
                  {cert.credential_url ? (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="View Credential"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-[10px]">View</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground/40 text-[10px]">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onPreview(cert)}
                      title="View Details"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicate(cert)}
                      title="Duplicate Certificate"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(cert)}
                      title="Edit Certificate"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer border border-slate-200/10 dark:border-slate-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(cert.id)}
                      title="Delete Certificate"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer border border-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
