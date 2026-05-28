import Link from 'next/link'
import { ArrowUpRight, Download, Mail, ExternalLink, Terminal, Presentation, BookOpen } from 'lucide-react'
import { Github, Linkedin } from '@/components/icons'
import { getProfile, getProjects, getSkills } from '@/lib/data-service'
import { SkillsMarquee } from '@/components/skills-marquee'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const profile = await getProfile()
  const projects = await getProjects()
  const skills = await getSkills()
  const featuredProjects = projects.filter(p => p.is_featured).slice(0, 6)

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            About Me
          </h1>
          <div className="shrink-0">
            <span className="inline-block text-primary text-xs uppercase font-extrabold tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full animate-pulse">
              Available for Opportunities
            </span>
          </div>
        </div>

        <div className="relative p-6 md:p-10 rounded-3xl glass-panel overflow-hidden">
          {/* Glow behind profile pic */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full filter blur-2xl pointer-events-none" />

          {/* Hero Details */}
          <div className="space-y-4">
            <p className="text-base font-semibold text-muted-foreground">
              {profile.headline}
            </p>

            <p className="text-sm md:text-base text-foreground/80 leading-relaxed text-justify">
              {profile.about_me}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {profile.resume_url ? (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-sm cursor-pointer"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>Download Resume (CV)</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-muted-foreground font-semibold text-sm border border-slate-300/10 cursor-not-allowed">
                  <Download className="w-4.5 h-4.5" />
                  <span>Resume (CV) Pending</span>
                </span>
              )}
              
              <Link
                href="/contact"
                className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card border border-slate-200/10 hover:border-primary/20 text-foreground font-semibold text-sm cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5 text-muted-foreground" />
                <span>Get In Touch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Featured Projects</h2>
            <p className="text-xs text-muted-foreground">Pinned top data science and ML showcases</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span>View all projects</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <div 
              key={project.id}
              className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              <div className="space-y-4">
                {/* Thumbnail container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200/10 to-slate-200/5 dark:from-slate-800/10 dark:to-slate-800/5 border border-slate-200/10 dark:border-slate-800/10 flex items-center justify-center">
                  {project.cover_image ? (
                    <>
                      {/* Ambient blur background */}
                      <img 
                        src={project.cover_image} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30 group-hover:scale-115 transition-transform duration-500 select-none pointer-events-none"
                      />
                      {/* Contained foreground image */}
                      <img 
                        src={project.cover_image} 
                        alt={project.title} 
                        className="w-full h-full object-contain relative z-10 group-hover:scale-103 transition-transform duration-500"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-500/10 to-violet-500/10 flex flex-col items-center justify-center p-4">
                      <span className="text-primary/25 group-hover:text-primary/50 group-hover:scale-110 transition-all font-black uppercase tracking-widest text-[9px] text-center leading-normal">
                        {project.sub_category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider">
                    {project.sub_category}
                  </span>
                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/10 dark:border-slate-800/10 mt-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                >
                  <span>Explore Writeup</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                
                <div className="ml-auto flex items-center gap-1.5">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="GitHub Repository"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.slide_url && (
                    <a
                      href={project.slide_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="Reporting Presentation"
                      title="Reporting Presentation"
                    >
                      <Presentation className="w-4 h-4" />
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="Live Demo"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.notebook_url && (
                    <a
                      href={project.notebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all"
                      aria-label="Open Notebook"
                      title="Open Notebook"
                    >
                      <BookOpen className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TECH STACK SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Tech stacks that i have used</h2>
          <p className="text-xs text-muted-foreground">My technical toolkit and areas of expertise</p>
        </div>
        <SkillsMarquee skills={skills} />
      </section>
    </div>
  )
}
