/* cspell:disable */
import { getProfile } from '@/lib/data-service'

// Admin upload caps the resume at 4MB (admin/actions/profile.ts); allow a little headroom.
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const FETCH_TIMEOUT_MS = 8_000

export interface ResumeDocument {
  mimeType: 'application/pdf'
  /** Base64-encoded PDF bytes, ready for a Gemini `inlineData` part */
  data: string
}

// Cached per resolved URL. Every new upload gets a new timestamped filename,
// so replacing the CV in the admin panel naturally invalidates this cache.
let cached: { url: string; doc: ResumeDocument } | null = null

/**
 * Fetches the resume PDF linked from the "Download Resume (CV)" button so the
 * AI can read its full contents. Returns null (chat keeps working without it)
 * when no resume is set or the file can't be fetched / isn't a valid PDF.
 */
export async function getResumeDocument(baseUrl: string): Promise<ResumeDocument | null> {
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
  if (cached?.url === key) return cached.doc

  try {
    const res = await fetch(key, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' })
    if (!res.ok) return null

    const declaredLength = Number(res.headers.get('content-length') || 0)
    if (declaredLength > MAX_RESUME_BYTES) return null

    const bytes = Buffer.from(await res.arrayBuffer())
    // Validate size and the PDF magic bytes rather than trusting the content-type header
    if (bytes.byteLength > MAX_RESUME_BYTES || bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return null
    }

    const doc: ResumeDocument = { mimeType: 'application/pdf', data: bytes.toString('base64') }
    cached = { url: key, doc }
    return doc
  } catch (err) {
    console.warn('Failed to load resume PDF for AI context:', err)
    return null
  }
}
