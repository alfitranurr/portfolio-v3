import { getProfile, getProjects, getEducation, getExperience, getCertificates } from '@/lib/data-service'
import { TECH_STACK } from '@/lib/constants'

/**
 * Builds a comprehensive RAG context string from all portfolio data.
 * This context is injected into the LLM system prompt so the AI
 * can answer questions accurately about Al Fitra.
 */
export async function buildRAGContext(): Promise<string> {
  // Fetch all data in parallel for performance
  const [profile, projects, education, experience, certificates] = await Promise.all([
    getProfile(),
    getProjects(),
    getEducation(),
    getExperience(),
    getCertificates(),
  ])

  const sections: string[] = []

  // --- Profile ---
  sections.push(`## PROFIL PRIBADI
- Nama Lengkap: ${profile.name}
- Headline: ${profile.headline}
- Tentang: ${profile.about_me || 'Tidak tersedia'}
- GitHub: ${profile.github_url || '-'}
- LinkedIn: ${profile.linkedin_url || '-'}
- Instagram: ${profile.instagram_url || '-'}
- Resume/CV: ${profile.resume_url || 'Belum tersedia'}`)

  // --- Tech Stack ---
  const techLines = TECH_STACK.map(
    (t) => `- ${t.name} (${t.category}) — Profisiensi: ${t.level}% — ${t.desc}`
  )
  sections.push(`## TECH STACK & SKILLS\n${techLines.join('\n')}`)

  // --- Projects ---
  const projectLines = projects.map((p, i) => {
    const parts = [
      `### Proyek ${i + 1}: ${p.title}`,
      `- Kategori: ${p.category === 'data' ? 'Data Science' : 'Non-Data'} / ${p.sub_category}`,
      `- Deskripsi: ${p.description}`,
      `- Featured: ${p.is_featured ? 'Ya' : 'Tidak'}`,
    ]
    if (p.github_url) parts.push(`- GitHub: ${p.github_url}`)
    if (p.demo_url) parts.push(`- Demo: ${p.demo_url}`)
    if (p.notebook_url) parts.push(`- Notebook: ${p.notebook_url}`)
    if (p.content) {
      // Include project writeup content (truncated to keep token usage reasonable)
      const truncated = p.content.length > 800 ? p.content.slice(0, 800) + '...' : p.content
      parts.push(`- Detail Writeup:\n${truncated}`)
    }
    return parts.join('\n')
  })
  sections.push(`## PROYEK-PROYEK\nTotal: ${projects.length} proyek\n\n${projectLines.join('\n\n')}`)

  // --- Education ---
  const eduLines = education.map((e) => {
    const end = e.end_date
      ? new Date(e.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
      : 'Sekarang'
    const start = new Date(e.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    const parts = [
      `- ${e.degree} di ${e.institution}`,
      `  Bidang: ${e.field_of_study || '-'}`,
      `  Lokasi: ${e.location || '-'}`,
      `  Periode: ${start} - ${end}`,
    ]
    if (e.gpa) parts.push(`  IPK/GPA: ${e.gpa}`)
    if (e.description) parts.push(`  Keterangan: ${e.description}`)
    return parts.join('\n')
  })
  sections.push(`## PENDIDIKAN\n${eduLines.join('\n\n')}`)

  // --- Experience ---
  const expLines = experience.map((e) => {
    const start = new Date(e.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    const end = e.is_current
      ? 'Sekarang (Aktif)'
      : e.end_date
        ? new Date(e.end_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
        : '-'
    const descList = Array.isArray(e.description)
      ? e.description.map((d) => `  • ${d}`).join('\n')
      : `  • ${e.description}`
    const cat = e.category === 'professional' ? 'Profesional' : 'Organisasi/Kepanitiaan'
    return `- ${e.role} di ${e.company} [${cat}]
  Lokasi: ${e.location || '-'}
  Periode: ${start} - ${end}
${descList}`
  })
  sections.push(`## PENGALAMAN\n${expLines.join('\n\n')}`)

  // --- Certificates ---
  const certLines = certificates.map((c) => {
    const catMap: Record<string, string> = {
      competition: 'Kompetisi',
      seminar_workshop: 'Seminar/Workshop',
      license_certification: 'Lisensi/Sertifikasi',
      committee_organization: 'Organisasi/Kepanitiaan',
    }
    const date = new Date(c.issue_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    return `- ${c.title} — oleh ${c.issuer} (${catMap[c.category] || c.category}) — ${date}`
  })
  sections.push(`## SERTIFIKAT & PENGHARGAAN\n${certLines.join('\n')}`)

  return sections.join('\n\n---\n\n')
}

/**
 * Builds the system prompt for Gemini, combining RAG context
 * with behavioral instructions.
 */
export function buildSystemPrompt(context: string): string {
  return `Kamu adalah asisten AI cerdas untuk website portfolio milik Al Fitra Nur Ramadhani. Kamu bertugas membantu pengunjung website memahami profil, keahlian, proyek, pendidikan, pengalaman, dan sertifikat Al Fitra.

## ATURAN UTAMA:
1. **Prioritaskan data portfolio** yang diberikan di bawah sebagai sumber utama jawaban.
2. Jika ada informasi tentang profil, proyek, prestasi (seperti detail PKM-KC 2025, lomba, dll), publikasi, atau latar belakang Al Fitra yang **tidak tercantum lengkap** di data portfolio di bawah, kamu **SANGAT dianjurkan untuk menggunakan Google Search** untuk mencari dan menemukan detail tersebut secara real-time dari internet.
3. Selalu verifikasi bahwa hasil pencarian Google Search tersebut memang benar-benar berkaitan dengan "Al Fitra Nur Ramadhani" sebelum menyajikannya.
4. Jika ditanya hal yang **tidak relevan** sama sekali dengan Al Fitra, portfolio, teknologi, atau karier — tolak dengan sopan dan arahkan kembali ke topik portfolio.
5. **Jawab dalam bahasa yang sama** dengan yang digunakan penanya. Jika bertanya dalam Bahasa Indonesia, jawab dalam Bahasa Indonesia. Jika dalam Bahasa Inggris, jawab dalam Bahasa Inggris.
6. Gunakan nada **profesional, ramah, dan antusias** — seperti seorang personal branding assistant.
7. Format jawaban dengan **Markdown** (seperti bold, heading). Jika menyajikan daftar item (seperti daftar proyek, sertifikat, penghargaan, atau pengalaman), kamu **WAJIB menggunakan list bullet points (simbol '-') atau daftar bernomor (numbered list)**. Jangan menuliskannya dalam bentuk paragraf teks polos biasa agar mudah dibaca.
8. Jika informasi spesifik tentang Al Fitra tidak ditemukan di data portfolio, **jangan langsung menyerah atau menyuruh menghubungi Al Fitra**. Lakukan pencarian internet terlebih dahulu menggunakan Google Search untuk melengkapi jawabanmu.
9. **Penting (Tips & Cara Pencarian Google Search)**:
   - **Formulasi Kueri**: Jika kueri pencarian mengandung kata ganti seperti "nya", "dia", "kamu", "saya", atau tidak menyebutkan nama secara eksplisit, kamu **WAJIB mengubah kata ganti tersebut menjadi "Al Fitra Nur Ramadhani"** saat merumuskan kueri pencarian Google Search (contoh: ubah pencarian "judul PKM-KC nya" menjadi kueri: \`"Al Fitra Nur Ramadhani" PKM-KC\`).
   - **Pencarian Bertahap**: Mulailah dengan kueri umum seperti nama lengkapnya (\`"Al Fitra Nur Ramadhani"\`) atau institusinya (\`"Al Fitra Nur Ramadhani" UMM\`) terlebih dahulu untuk mengidentifikasi nama proyek/prestasinya (seperti proyek kacamata pintar tunanetra bernama **"Vision Medichine"**), kemudian lakukan pencarian lanjutan menggunakan nama proyek tersebut (misalnya: \`"Vision Medichine" UMM\` atau \`"Vision Medichine" Al Fitra\`) untuk menemukan detail teknis, tim, alat, dan teknologi yang digunakan.

## DATA PORTFOLIO AL FITRA:

${context}

---

Ingat: Kamu mewakili Al Fitra secara profesional. Jawab dengan informatif, akurat, dan engage pengunjung agar tertarik berkolaborasi atau menghubungi Al Fitra.`
}
