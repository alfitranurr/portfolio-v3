import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, ExternalLink, Calendar, BookOpen, Sparkles, Presentation } from 'lucide-react'
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
          {project.slide_url && (
            <a
              href={project.slide_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/25 transition-all text-xs cursor-pointer"
            >
              <Presentation className="w-4 h-4" />
              <span>View Reporting Presentation</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
        {project.cover_image ? (
          <>
            {/* Blurred ambient background */}
            <img 
              src={project.cover_image} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-105 opacity-30 select-none pointer-events-none"
            />
            {/* Contained foreground image */}
            <img 
              src={project.cover_image} 
              alt={project.title} 
              className="w-full h-full object-contain relative z-10"
            />
          </>
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
            h1: ({node, ...props}) => <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-4 pb-2 border-b border-slate-200/10 dark:border-slate-800/10 text-foreground" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold mt-8 mb-4 pb-2 border-b border-slate-200/10 dark:border-slate-800/10 text-foreground/95" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-bold mt-6 mb-3 text-foreground/90" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-base md:text-lg font-bold mt-4 mb-2 text-foreground/85" {...props} />,
            p: ({node, ...props}) => <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside mb-4 pl-6 text-sm md:text-base text-foreground/80 space-y-1.5" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-4 pl-6 text-sm md:text-base text-foreground/80 space-y-1.5" {...props} />,
            li: ({node, ...props}) => {
              if (!props.children || (Array.isArray(props.children) && props.children.length === 0)) return null;
              const isEmpty = Array.isArray(props.children)
                ? props.children.every(c => typeof c === 'string' && c.trim() === '')
                : typeof props.children === 'string' && props.children.trim() === '';
              if (isEmpty) return null;
              return <li className="pl-1 leading-relaxed mb-0.5" {...props} />;
            },
            code({node, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match && !children.includes('\n')
              return isInline ? (
                <code className="bg-slate-200/10 dark:bg-slate-800/20 text-primary dark:text-primary-foreground/90 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200/5 dark:border-slate-800/5" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="bg-slate-950 dark:bg-slate-900/40 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-200/5 dark:border-slate-800/10 my-4 shadow-inner">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )
            },
            hr: ({node, ...props}) => <hr className="my-6 border-t border-slate-200/10 dark:border-slate-800/10" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-slate-300 dark:border-slate-700 pl-4 py-1.5 italic text-muted-foreground my-4" {...props} />
            ),
            table: ({node, ...props}) => <table className="w-full border-collapse border border-slate-200/10 dark:border-slate-800/10 mb-4" {...props} />,
            thead: ({node, ...props}) => <thead className="bg-slate-200/5 dark:bg-slate-800/5" {...props} />,
            th: ({node, ...props}) => <th className="border border-slate-200/10 dark:border-slate-800/10 px-4 py-2 text-left font-bold text-sm" {...props} />,
            td: ({node, ...props}) => <td className="border border-slate-200/10 dark:border-slate-800/10 px-4 py-2 text-sm text-foreground/80" {...props} />,
            a: ({node, ...props}) => <a className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
          }}
        >
          {project.content || '*No case study documentation provided yet.*'}
        </ReactMarkdown>
      </article>
    </div>
  )
}
