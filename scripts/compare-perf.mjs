// Membandingkan dua hasil scripts/measure-images.mjs.
// Pemakaian: node scripts/compare-perf.mjs baseline-local fase-0-local
// Hasil: docs/perf/compare-<a>-vs-<b>.md

import fs from 'node:fs'
import path from 'node:path'

const [a, b] = process.argv.slice(2)
if (!a || !b) {
  console.error('Pemakaian: node scripts/compare-perf.mjs <label-a> <label-b>')
  process.exit(1)
}

const dir = path.resolve('docs/perf')
const load = (l) => JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), 'utf8'))
const A = load(a)
const B = load(b)

const kb = (v) => (v >= 1024 * 1024 ? `${(v / 1024 / 1024).toFixed(2)} MB` : `${Math.round(v / 1024)} KB`)
const s = (v) => (v == null ? '–' : `${(v / 1000).toFixed(2)} s`)
const delta = (x, y, fmt) => {
  if (x == null || y == null) return `${fmt(x)} → ${fmt(y)}`
  const pct = x === 0 ? 0 : Math.round(((y - x) / x) * 100)
  const sign = pct > 0 ? '+' : ''
  return `${fmt(x)} → **${fmt(y)}** (${sign}${pct}%)`
}
// Halaman detail project bisa beda id antar run; samakan sebagai /projects/[id]
const key = (p) => `${p.profile}|${p.path.replace(/^\/projects\/[^/]+$/, '/projects/[id]')}`

const lines = [`# Perbandingan: ${a} → ${b}`, '', `- ${a}: ${A.base} (${A.date})`, `- ${b}: ${B.base} (${B.date})`, '']
for (const profile of [...new Set(B.pages.map((p) => p.profile))]) {
  lines.push(`## ${profile}`, '')
  lines.push('| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (ukuran) | Gambar penuh (ukuran) | Preload img | `<img>` non-lazy |')
  lines.push('|---|---|---|---|---|---|---|')
  const mapA = new Map(A.pages.map((p) => [key(p), p]))
  for (const pb of B.pages.filter((p) => p.profile === profile)) {
    const pa = mapA.get(key(pb))
    if (!pa) continue
    lines.push(
      `| \`${key(pb).split('|')[1]}\` | ${delta(pa.lcpMs, pb.lcpMs, s)} | ${delta(pa.aboveFoldImagesLoadedMs, pb.aboveFoldImagesLoadedMs, s)} | ${delta(pa.initial.bytes, pb.initial.bytes, kb)} | ${delta(pa.full.bytes, pb.full.bytes, kb)} | ${pa.preloadImageLinks} → ${pb.preloadImageLinks} | ${pa.imgNotLazy} → ${pb.imgNotLazy} |`
    )
  }
  lines.push('')
}
const out = path.join(dir, `compare-${a}-vs-${b}.md`)
fs.writeFileSync(out, lines.join('\n'))
console.log(lines.join('\n'))
console.log(`\nTersimpan: ${path.relative(process.cwd(), out)}`)
