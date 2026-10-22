/* cspell:disable */
import { getProfile, getProjects, getEducation, getExperience, getCertificates, getSkills, getPhotos } from '@/lib/data-service'

// --- Token budget ---
// The whole context is resent on every chat request, so the format is kept compact:
// no repeated labels or placeholder lines, short dates, certificates grouped by category.
const PROJECT_DESCRIPTION_MAX = 450 // chars; longer descriptions are cut at a sentence boundary
const PROJECT_WRITEUP_MAX = 300 // chars of the markdown write-up (plain text) per project

const CERT_CATEGORY_LABELS: Record<string, string> = {
  competition: 'Kompetisi',
  seminar_workshop: 'Seminar/Workshop',
  license_certification: 'Lisensi/Sertifikasi',
  committee_organization: 'Organisasi/Kepanitiaan',
}

/** Admin forms use "-" as an empty placeholder; treat it like a missing value. */
function hasText(value: string | null | undefined): value is string {
  return !!value && value.trim() !== '' && value.trim() !== '-'
}

/** "Sep 2024" — shorter than the long month name, same information. */
function monthYear(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
}

/**
 * Markdown → compact plain text (drops images, link URLs, heading/bold markers, extra whitespace).
 * With `max`, cuts at the last sentence end that fits (or the last word boundary if none is close enough).
 */
function plainText(markdown: string, max?: number): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!max || text.length <= max) return text

  const slice = text.slice(0, max)
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
  if (sentenceEnd >= max * 0.6) return slice.slice(0, sentenceEnd + 1) + ' …'
  const wordEnd = slice.lastIndexOf(' ')
  return (wordEnd > 0 ? slice.slice(0, wordEnd) : slice).replace(/[\s,;:–—-]+$/, '') + '…'
}

/**
 * Builds a comprehensive RAG context string from all portfolio data.
 * This context is injected into the LLM system prompt so the AI
 * can answer questions accurately about Al Fitra.
 */
export async function buildRAGContext(): Promise<string> {
  // Fetch all data in parallel for performance
  const [profile, projects, education, experience, certificates, skills, photos] = await Promise.all([
    getProfile(),
    getProjects(),
    getEducation(),
    getExperience(),
    getCertificates(),
    getSkills(),
    getPhotos(),
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
  const techLines = skills.map(
    (t) => `- ${t.name} (${t.category}, ${t.level}%)${hasText(t.desc) ? `: ${t.desc}` : ''}`
  )
  sections.push(`## TECH STACK & SKILLS\n${techLines.join('\n')}`)

  // --- Projects ---
  const projectLines = projects.map((p) => {
    const kind = p.category === 'data' ? 'Data Science' : 'Non-Data'
    const parts = [`### ${p.title} [${kind} / ${p.sub_category}${p.is_featured ? ', Featured' : ''}]`]
    if (hasText(p.description)) parts.push(plainText(p.description, PROJECT_DESCRIPTION_MAX))
    if (hasText(p.content)) parts.push(`Writeup: ${plainText(p.content, PROJECT_WRITEUP_MAX)}`)
    const links = [
      ['GitHub', p.github_url],
      ['Demo', p.demo_url],
      ['Notebook', p.notebook_url],
    ].filter(([, url]) => url).map(([label, url]) => `${label}: ${url}`)
    if (links.length > 0) parts.push(links.join(' | '))
    return parts.join('\n')
  })
  sections.push(`## PROYEK (${projects.length})\n${projectLines.join('\n\n')}`)

  // --- Education ---
  const eduLines = education.map((e) => {
    const period = `${monthYear(e.start_date)} – ${e.end_date ? monthYear(e.end_date) : 'Sekarang'}`
    const field = e.field_of_study ? `, ${e.field_of_study}` : ''
    const location = e.location ? `, ${e.location}` : ''
    const gpa = e.gpa ? `, IPK ${e.gpa}` : ''
    const line = `- ${e.degree}${field} — ${e.institution}${location} (${period})${gpa}`
    return hasText(e.description) ? `${line}\n  ${plainText(e.description)}` : line
  })
  sections.push(`## PENDIDIKAN\n${eduLines.join('\n')}`)

  // --- Experience ---
  const expLines = experience.map((e) => {
    const end = e.is_current ? 'Sekarang' : e.end_date ? monthYear(e.end_date) : '-'
    const cat = e.category === 'professional' ? 'Profesional' : 'Organisasi'
    const location = e.location ? `, ${e.location}` : ''
    const points = (Array.isArray(e.description) ? e.description : [e.description])
      .filter(hasText)
      .map((d) => `  - ${d}`)
    return [`- ${e.role} — ${e.company} [${cat}]${location} (${monthYear(e.start_date)} – ${end})`, ...points].join('\n')
  })
  sections.push(`## PENGALAMAN\n${expLines.join('\n')}`)

  // --- Certificates (grouped so the category label isn't repeated on every line) ---
  const certGroups = new Map<string, string[]>()
  for (const c of certificates) {
    const label = CERT_CATEGORY_LABELS[c.category] || c.category
    const lines = certGroups.get(label) ?? []
    lines.push(`- ${c.title} — ${c.issuer} (${monthYear(c.issue_date)})`)
    certGroups.set(label, lines)
  }
  const certBlocks = [...certGroups].map(([label, lines]) => `### ${label}\n${lines.join('\n')}`)
  sections.push(`## SERTIFIKAT & PENGHARGAAN (${certificates.length})\n${certBlocks.join('\n')}`)

  // --- Photos / Moment Recap ---
  const photoLines = photos.map(
    (ph) => `- ${ph.title || 'Momen'} (${ph.year || '-'})${hasText(ph.description) ? `: ${ph.description}` : ''}`
  )
  if (photoLines.length > 0) {
    sections.push(`## DOKUMENTASI & MOMEN (MOMENT RECAP)\n${photoLines.join('\n')}`)
  }

  return sections.join('\n\n')
}

/**
 * Builds the system prompt for Gemini, combining RAG context
 * with behavioral instructions.
 */
export function buildSystemPrompt(context: string, options: { hasResume?: boolean } = {}): string {
  const resumeRule = options.hasResume
    ? `
10. **Dokumen CV/Resume (PDF)**: Setiap pesan pengguna disertai lampiran file PDF yang merupakan dokumen CV/Resume resmi Al Fitra (file yang sama dengan tombol "Download Resume (CV)" di website). Itu adalah lampiran dari sistem, **bukan file yang dikirim oleh pengunjung** — jangan menyebutnya sebagai "file yang Anda kirim". Baca dan gunakan isinya sebagai sumber utama bersama data portfolio. Jika ada perbedaan, utamakan data yang paling detail/terbaru, dan sebutkan bahwa informasinya berasal dari CV bila relevan.`
    : ''

  return `Kamu adalah asisten AI cerdas untuk website portfolio milik Al Fitra Nur Ramadhani. Kamu bertugas membantu pengunjung website memahami profil, keahlian, proyek, pendidikan, pengalaman, dan sertifikat Al Fitra.

## ATURAN UTAMA:
1. **Prioritaskan data portfolio** yang diberikan di bawah sebagai sumber utama jawaban.
2. Jika ada informasi tentang profil, proyek, prestasi (seperti detail PKM-KC 2025, lomba, dll), publikasi, atau latar belakang Al Fitra yang **tidak tercantum lengkap** di data portfolio di bawah, kamu **SANGAT dianjurkan untuk menggunakan Google Search** untuk mencari dan menemukan detail tersebut secara real-time dari internet.
3. Selalu verifikasi bahwa hasil pencarian Google Search tersebut memang benar-benar berkaitan dengan "Al Fitra Nur Ramadhani" sebelum menyajikannya.
4. Jika ditanya hal yang **tidak relevan** sama sekali dengan Al Fitra, portfolio, teknologi, atau karier — tolak dengan sopan dan arahkan kembali ke topik portfolio.
5. **Jawab dalam bahasa yang sama** dengan yang digunakan penanya. Jika bertanya dalam Bahasa Indonesia, jawab dalam Bahasa Indonesia. Jika dalam Bahasa Inggris, jawab dalam Bahasa Inggris.
6. Gunakan nada **profesional, ramah, dan antusias** — seperti seorang personal branding assistant.
7. **FORMAT JAWABAN RAPI & STRUKTUR POIN-POIN (SANGAT PENTING)**:
   - **Selalu Gunakan Bullet Points**: Sajikan informasi utama dalam bentuk poin-poin tertata rapi menggunakan list markdown. Jangan pernah menyajikan daftar keahlian, proyek, pengalaman, atau sertifikat dalam paragraf teks biasa.
   - **Highlight Cetak Tebal (Bold Keywords)**: Setiap item poin WAJIB diawali dengan judul/kategori yang dicetak tebal (contoh: "- **Bahasa Pemrograman**: Python, SQL...").
   - **Gunakan Hirarki Sub-Poin (Nested Sub-bullets)**: Jika satu kategori memiliki banyak detail, gunakan sub-bullet ber-indentasi (2 spasi), contoh:
     - **Bahasa Pemrograman**:
       - **Python**: Digunakan untuk Machine Learning, data analysis, dan pemrosesan data.
       - **SQL**: Digunakan untuk query complexes dan optimasi database.
   - **Gunakan Subheading Markdown**: Gunakan "###" atau "####" untuk memisahkan kategori besar agar tampilan pesan memiliki hirarki visual yang jelas.
   - **Hindari Paragraf Panjang (Wall of Text)**: Buat ringkasan pembuka 1-2 kalimat pendek, lalu langsung sajikan poin-poin dengan spasi yang lega dan rapi.
8. Jika informasi spesifik tentang Al Fitra tidak ditemukan di data portfolio, **jangan langsung menyerah atau menyuruh menghubungi Al Fitra**. Lakukan pencarian internet terlebih dahulu menggunakan Google Search untuk melengkapi jawabanmu.
9. **Penting (Tips & Cara Pencarian Google Search)**:
   - **Formulasi Kueri**: Jika kueri pencarian mengandung kata ganti seperti "nya", "dia", "kamu", "saya", atau tidak menyebutkan nama secara eksplisit, kamu **WAJIB mengubah kata ganti tersebut menjadi "Al Fitra Nur Ramadhani"** saat merumuskan kueri pencarian Google Search (contoh: ubah pencarian "judul PKM-KC nya" menjadi kueri: '"Al Fitra Nur Ramadhani" PKM-KC').
   - **Pencarian Bertahap**: Mulailah dengan kueri umum seperti nama lengkapnya ("Al Fitra Nur Ramadhani") atau institusinya ("Al Fitra Nur Ramadhani" UMM) terlebih dahulu untuk mengidentifikasi nama proyek/prestasinya (seperti proyek kacamata pintar tunanetra bernama **"Vision Medichine"**), kemudian lakukan pencarian lanjutan menggunakan nama proyek tersebut (misalnya: "Vision Medichine" UMM atau "Vision Medichine" Al Fitra) untuk menemukan detail teknis, tim, alat, dan teknologi yang digunakan.${resumeRule}

## DATA PORTFOLIO AL FITRA:

${context}

---

Ingat: Kamu mewakili Al Fitra secara profesional. Jawab dengan informatif, akurat, dan engage pengunjung agar tertarik berkolaborasi atau menghubungi Al Fitra.`
}
