# Pengukuran gambar — production-icn1-admin

- Waktu: 2026-10-03T22:10:42.168Z
- Target: https://alfitranurr.vercel.app
- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.
- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.

## Desktop 1440×900, DPR 1, tanpa throttle

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/admin/projects` | 1.56 s | 1.12 s (12 img) | 24 / 938 KB | 24 / 938 KB | 3/24 | 3 | 0 |
| `/admin/certificates` | 1.28 s | 1.45 s (9 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 1.86 s | 0.90 s (1 img) | 1 / 54 KB | 1 / 54 KB | 1/1 | 1 | 0 |
| `/admin/experience` | 1.67 s | 1.04 s (8 img) | 10 / 59 KB | 10 / 59 KB | 0/10 | 0 | 0 |
| `/admin/education` | 1.00 s | 0.79 s (4 img) | 4 / 45 KB | 4 / 45 KB | 0/4 | 0 | 0 |
| `/admin/skills` | 1.22 s | 1.31 s (8 img) | 9 / 30 KB | 9 / 30 KB | 0/9 | 0 | 0 |

<details><summary>Detail LCP & file terbesar</summary>

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1783957201747/w640.webp
- 119 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779806078735/w640.webp
- 114 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w640.webp
- 112 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779724908832/w533.webp
- 93 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779725949626/w536.webp
- 88 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w640.webp

**`/admin/certificates`** — LCP: `<h1>` "Certificates & Awards"
- 7 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w128-rj-l90
- 6 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1EPePD0fPPPIVPzwVQvT7DHMimiad4mTn=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1pMX745hZLAizcyz662x2WcgZCTZWmcqo=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w128-rj-l90

**`/admin/photos`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832424518/w640.webp
- 54 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832424518/w640.webp

**`/admin/experience`** — LCP: `<p>` "Manage professional experience, committee roles, and organiz"
- 12 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641512127/w128.webp
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1781945470536/w128.webp
- 8 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641590707/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641473732/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641454409/w128.webp

**`/admin/education`** — LCP: `<p>` "Manage academic background, degrees, certifications, and edu"
- 14 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474587248/w128.webp
- 12 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474373030/w128.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474575437/w128.webp
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474595374/w128.webp

**`/admin/skills`** — LCP: `<p>` "Manage technical skills, soft skills, and tools."
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769813570/w128.webp
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1782227882388/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781323760886/w100.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788773890317/w128.webp

</details>

## Mobile 412×915, DPR 2.625, 4G (9 Mbps / 60 ms RTT)

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/admin/projects` | 2.00 s | 1.58 s (2 img) | 16 / 979 KB | 24 / 1.48 MB | 3/24 | 3 | 0 |
| `/admin/certificates` | 1.43 s | 1.28 s (5 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 1.39 s | 0.94 s (1 img) | 1 / 105 KB | 1 / 105 KB | 1/1 | 1 | 0 |
| `/admin/experience` | 1.07 s | 1.00 s (6 img) | 10 / 59 KB | 10 / 59 KB | 0/10 | 0 | 0 |
| `/admin/education` | 1.10 s | 0.97 s (4 img) | 4 / 45 KB | 4 / 45 KB | 0/4 | 0 | 0 |
| `/admin/skills` | 1.14 s | 0.88 s (6 img) | 9 / 30 KB | 9 / 30 KB | 0/9 | 0 | 0 |

<details><summary>Detail LCP & file terbesar</summary>

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 193 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w960.webp
- 147 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w960.webp
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779806078735/w736.webp
- 131 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 112 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779724908832/w533.webp

**`/admin/certificates`** — LCP: `<p>` "Manage professional certifications, competition awards, and "
- 7 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w128-rj-l90
- 6 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1EPePD0fPPPIVPzwVQvT7DHMimiad4mTn=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1pMX745hZLAizcyz662x2WcgZCTZWmcqo=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w128-rj-l90

**`/admin/photos`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832424518/w960.webp
- 105 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832424518/w960.webp

**`/admin/experience`** — LCP: `<p>` "Manage professional experience, committee roles, and organiz"
- 12 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641512127/w128.webp
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1781945470536/w128.webp
- 8 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641590707/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641473732/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641454409/w128.webp

**`/admin/education`** — LCP: `<p>` "Manage academic background, degrees, certifications, and edu"
- 14 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474587248/w128.webp
- 11 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474373030/w128.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474575437/w128.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474595374/w128.webp

**`/admin/skills`** — LCP: `<p>` "Manage technical skills, soft skills, and tools."
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769813570/w128.webp
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1782227882388/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788773890317/w128.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781323760886/w100.webp

</details>

## Header gambar yang terlihat

- Cache-Control: `public, max-age=31536000`, `private, max-age=86400, no-transform`
- Content-Type: `image/webp`, `image/jpeg`
