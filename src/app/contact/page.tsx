import { Mail, MessageSquare } from 'lucide-react'
import { Github, Linkedin, Instagram } from '@/components/icons'
import { ContactForm } from '@/components/contact-form'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Al Fitra Nur Ramadhani for data science opportunities.',
}

export default function ContactPage() {
  const socialCards = [
    {
      name: 'Email',
      username: 'alfitranurr@gmail.com',
      href: 'mailto:alfitranurr@gmail.com',
      icon: Mail,
      colorClass: 'text-primary',
    },
    {
      name: 'LinkedIn',
      username: 'al-fitra-nur-ramadhani',
      href: 'https://www.linkedin.com/in/al-fitra-nur-ramadhani/',
      icon: Linkedin,
      colorClass: 'text-[#0a66c2] dark:text-[#0077b5]',
    },
    {
      name: 'Instagram',
      username: 'rmdhani_ii',
      href: 'https://www.instagram.com/rmdhani_ii',
      icon: Instagram,
      colorClass: 'text-[#e1306c]',
    },
    {
      name: 'GitHub',
      username: 'alfitranurr',
      href: 'https://github.com/alfitranurr',
      icon: Github,
      colorClass: 'text-foreground',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Get In Touch</h1>
        <p className="text-sm text-muted-foreground">Let&apos;s discuss projects, opportunities, or statistical insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Social Connections */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4">
            <h2 className="font-extrabold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Connect Digitally</span>
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Feel free to reach out directly through my social channels. I am most responsive on LinkedIn and Instagram.
            </p>

            <div className="space-y-3 pt-2">
              {socialCards.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-slate-200/10 dark:border-slate-800/10 hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className={`p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 group-hover:scale-105 transition-transform ${social.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{social.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">@{social.username}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2">
          <div className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-200/10 dark:border-slate-800/10 space-y-4">
            <div className="space-y-1">
              <h2 className="font-extrabold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span>Send a Direct Message</span>
              </h2>
              <p className="text-xs text-muted-foreground">Fill in the details below and I will get back to you as soon as possible</p>
            </div>
            
            {/* Action form */}
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
