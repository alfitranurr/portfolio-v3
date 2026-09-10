import Link from 'next/link'
import { ArrowUpRight, Download, Rocket } from 'lucide-react'
import { getProfile, getProjects, getSkills, getPhotos, sortFeaturedProjects } from '@/lib/data-service'
import { SkillsMarquee } from '@/components/skills-marquee'
import { JourneyMarquee } from '@/components/journey-marquee'
import { FeaturedProjectCard } from '@/components/featured-project-card'

export const revalidate = 3600 // Revalidate cache every hour (ISR)

export default async function HomePage() {
  const [profile, projects, skills, photos] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkills(),
    getPhotos()
  ])
  const featuredProjects = sortFeaturedProjects(projects.filter(p => p.is_featured)).slice(0, 9)

  return (
    <div className="space-y-16">
      {/* 1. HERO SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            About Me
          </h1>
          <div className="shrink-0">
            <span className="inline-block text-foreground text-xs uppercase font-extrabold tracking-widest bg-foreground/10 border border-foreground/20 px-3 py-1 rounded-full animate-pulse">
              Available for Opportunities
            </span>
          </div>
        </div>

        <div className="relative p-6 md:p-10 rounded-3xl glass-panel overflow-hidden glow-card-top-left">
          {/* Hero Details */}
          <div className="space-y-4">
            <p className="text-base font-semibold text-muted-foreground">
              {profile.headline}
            </p>

            <p className="text-sm md:text-base text-foreground leading-relaxed text-justify">
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
            className="group flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 text-foreground hover:bg-foreground/10 dark:hover:bg-white/10 hover:border-foreground/20 dark:hover:border-white/20 transition-all cursor-pointer"
          >
            <span>View all projects</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project, index) => (
            <FeaturedProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* 3. TECH STACK SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {profile.skills_title || "Tech stacks that i have used"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {profile.skills_subtitle || "My technical toolkit and areas of expertise"}
          </p>
        </div>
        <SkillsMarquee skills={skills} />
      </section>

      {/* MOMENT RECAP SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Moment Recap</h2>
          <p className="text-xs text-muted-foreground">Important milestones and snapshots of my life</p>
        </div>
        <JourneyMarquee initialPhotos={photos} />
      </section>

      {/* 4. WORK TOGETHER SECTION */}
      <section className="p-6 md:p-10 rounded-3xl glass-panel relative overflow-hidden glow-card-top-left">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5.5 h-5.5 text-primary animate-pulse" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Let&apos;s work together!
            </h2>
          </div>

          <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
            I&apos;m open for freelance projects; feel free to email me to see how we can collaborate.
          </p>

          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-black/10 dark:shadow-white/5"
            >
              Contact me
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
