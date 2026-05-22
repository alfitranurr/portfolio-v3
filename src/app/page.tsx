import Link from 'next/link'
import { ArrowUpRight, Download, Mail, ExternalLink, Terminal } from 'lucide-react'
import { Github, Linkedin } from '@/components/icons'
import { getProfile, getProjects } from '@/lib/data-service'
import { SkillsGrid } from '@/components/skills-grid'

export default async function HomePage() {
  const profile = await getProfile()
  const projects = await getProjects()
  const featuredProjects = projects.filter(p => p.is_featured).slice(0, 3)

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="relative p-6 md:p-10 rounded-3xl glass-panel flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden">
        {/* Glow behind profile pic */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full filter blur-2xl pointer-events-none" />
        
        {/* Profile Picture */}
        <div className="relative shrink-0 w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden glass-card border border-white/20 dark:border-white/10 flex items-center justify-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={profile.avatar_url} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 flex flex-col items-center justify-center text-foreground font-black text-4xl">
              <span>{profile.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
          )}
        </div>

        {/* Hero Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              {profile.name}
            </h1>
            <p className="text-lg md:text-xl font-bold text-muted-foreground">
              {profile.headline}
            </p>
            <div className="pt-1">
              <span className="inline-block text-primary text-xs uppercase font-extrabold tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                Available for Opportunities
              </span>
            </div>
          </div>

          <p className="text-sm md:text-base text-foreground/80 leading-relaxed max-w-2xl">
            {profile.about_me}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
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
      </section>

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Featured Projects</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <div 
              key={project.id}
              className="group p-6 rounded-3xl glass-panel hover:border-primary/20 flex flex-col justify-between transition-all duration-300 relative"
            >
              {/* Decorative top dot */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all" />

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {project.sub_category}
                  </span>
                  <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-foreground group-hover:text-primary transition-colors"
                >
                  <span>Explore Writeup</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                    aria-label="GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TECH STACK SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Interactive Tech Stack</h2>
          <p className="text-xs text-muted-foreground">My technical toolkit and proficiency levels</p>
        </div>
        <SkillsGrid />
      </section>
    </div>
  )
}
