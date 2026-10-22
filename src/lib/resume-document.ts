/* cspell:disable */
import { extractText, getDocumentProxy } from 'unpdf'
import { getProfile } from '@/lib/data-service'

// Admin upload caps the resume at 4MB (admin/actions/profile.ts); allow a little headroom.
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const FETCH_TIMEOUT_MS = 8_000
// Safety cap on the text injected into the system prompt (a 1–2 page CV is ~4–8k chars)
const MAX_RESUME_CHARS = 12_000

// Cached per resolved URL. Every new upload gets a new timestamped filename,
// so replacing the CV in the admin panel naturally invalidates this cache.
let cached: { url: string; text: string } | null = null

/**
 * Text of the resume PDF linked from the "Download Resume (CV)" button, for the
 * AI system prompt. Sent as text rather than a PDF attachment on purpose: with a
 * document attached to the turn, Gemini stops using Google Search grounding.
 * Returns null (chat keeps working without it) when no resume is set or the file
 * can't be fetched / isn't a valid PDF / has no extractable text.
 */
export async function getResumeText(baseUrl: string): Promise<string | null> {
  const profile = await getProfile()
  if (!profile.resume_url) return null

  let url: URL
  try {
    // Relative paths (e.g. the mock-mode "/mock-resume.pdf") resolve against the request origin
    url = new URL(profile.resume_url, baseUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const key = url.toString()
  if (cached?.url === key) return cached.text

  try {
    const res = await fetch(key, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' })
    if (!res.ok) return null

    const declaredLength = Number(res.headers.get('content-length') || 0)
    if (declaredLength > MAX_RESUME_BYTES) return null

    const bytes = new Uint8Array(await res.arrayBuffer())
    // Validate size and the PDF magic bytes rather than trusting the content-type header
    if (bytes.byteLength > MAX_RESUME_BYTES || Buffer.from(bytes.subarray(0, 5)).toString('latin1') !== '%PDF-') {
      return null
    }

    const pdf = await getDocumentProxy(bytes)
    const { text } = await extractText(pdf, { mergePages: true })
    const clean = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_RESUME_CHARS)
    if (!clean) return null // scanned/image-only PDF

    cached = { url: key, text: clean }
    return clean
  } catch (err) {
    console.warn('Failed to load resume PDF for AI context:', err instanceof Error ? err.message : err)
    return null
  }
}
