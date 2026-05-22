import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, ExternalLink, Calendar, BookOpen, Sparkles } from 'lucide-react'
import { Github } from '@/components/icons'
import { getProjectById } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Projects</span>
      </Link>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
              {project.sub_category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 dark:bg-white/5 border border-slate-200/10 dark:border-slate-800/10 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            {project.title}
          </h1>
        </div>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {project.description}
        </p>

        {/* Buttons Panel */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-slate-200/10 hover:border-primary/20 text-foreground font-semibold text-xs transition-all cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>View Repository</span>
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all text-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demonstration</span>
            </a>
          )}
          {project.notebook_url && (
            <a
              href={project.notebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-cyan-500/25 transition-all text-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Notebook</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={project.cover_image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-cyan-500/5 to-violet-500/5 flex flex-col items-center justify-center p-6">
            <Sparkles className="text-primary/20 w-12 h-12 mb-2" />
            <span className="text-muted-foreground/30 font-bold uppercase tracking-wider text-xs text-center">
              {project.title} Case Study
            </span>
          </div>
        )}
      </div>

      {/* Interactive Embed (Tableau Dashboard or Plotly charts) */}
      {project.embed_code && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-foreground">Interactive Dashboard</h2>
          <div 
            className="w-full overflow-hidden rounded-2xl border border-slate-200/10 dark:border-slate-800/10 bg-slate-900/50"
            dangerouslySetInnerHTML={{ __html: project.embed_code }}
          />
        </section>
      )}

      {/* Case Study Markdown Content */}
      <article className="p-6 md:p-10 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-black mt-8 mb-4 text-foreground border-b border-slate-200/10 dark:border-slate-800/10 pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-foreground/95" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground/90" {...props} />,
            p: ({node, ...props}) => <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4 text-sm md:text-base text-foreground/80 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4 text-sm md:text-base text-foreground/80 space-y-2" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            code({node, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match && !children.includes('\n')
              return isInline ? (
                <code className="bg-slate-200/30 dark:bg-slate-800/40 px-1.5 py-0.5 rounded font-mono text-xs text-primary" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800/40 my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )
            },
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground bg-white/5 dark:bg-white/5 py-2 pr-4 rounded-r-xl my-4" {...props} />
            ),
            a: ({node, ...props}) => <a className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
          }}
        >
          {project.content || '*No case study documentation provided yet.*'}
        </ReactMarkdown>
      </article>
    </div>
  )
}
