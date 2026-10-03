# Pengukuran gambar — production-after

- Waktu: 2026-10-03T21:42:40.248Z
- Target: https://alfitranurr.vercel.app
- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.
- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.

## Desktop 1440×900, DPR 1, tanpa throttle

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/` | 1.30 s | 1.42 s (10 img) | 38 / 958 KB | 38 / 958 KB | 4/148 | 4 | 80 |
| `/projects` | 1.59 s | 0.52 s (13 img) | 29 / 1.02 MB | 29 / 1.02 MB | 4/30 | 4 | 0 |
| `/certificates` | 2.41 s | 2.03 s (13 img) | 52 / 1.58 MB | 111 / 3.51 MB | 4/112 | 4 | 0 |
| `/experience` | 1.08 s | 1.26 s (4 img) | 9 / 48 KB | 9 / 48 KB | 1/10 | 1 | 0 |
| `/education` | 1.20 s | 1.16 s (5 img) | 5 / 49 KB | 5 / 49 KB | 1/6 | 1 | 0 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 2.49 s | 1.44 s (3 img) | 3 / 141 KB | 3 / 141 KB | 2/4 | 2 | 0 |
| `/admin/projects` | 3.81 s | 3.34 s (12 img) | 24 / 938 KB | 24 / 938 KB | 3/24 | 3 | 0 |
| `/admin/certificates` | 2.26 s | 2.08 s (9 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 2.62 s | 2.01 s (1 img) | 1 / 54 KB | 1 / 54 KB | 1/1 | 1 | 0 |
| `/admin/experience` | 2.17 s | 2.14 s (8 img) | 10 / 59 KB | 10 / 59 KB | 0/10 | 0 | 0 |
| `/admin/education` | 2.53 s | 2.46 s (4 img) | 4 / 45 KB | 4 / 45 KB | 0/4 | 0 | 0 |
| `/admin/skills` | 2.61 s | 2.29 s (8 img) | 9 / 30 KB | 9 / 30 KB | 0/9 | 0 | 0 |

<details><summary>Detail LCP & file terbesar</summary>

**`/`** — LCP: `<p>` "Data & AI Specialist with expertise in Data Analytics, Machi"
- 188 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780834384166/w640.webp
- 114 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w640.webp
- 88 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w640.webp
- 75 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w640.webp
- 60 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832657816/w640.webp
- oversized 7.1×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769828377/w128.webp
- oversized 7.1×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769828377/w128.webp
- oversized 7.1×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769828377/w128.webp

**`/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1783969421916/w640.webp
- 119 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779806078735/w640.webp
- 114 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w640.webp
- 112 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779724908832/w533.webp
- 93 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779725949626/w536.webp
- 88 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w640.webp

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1UrD8tFeMWqiw-noMnPkDMe4LILSQph7W=w640-rj-l90
- 185 KB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w640-rj-l90
- 107 KB — https://lh3.googleusercontent.com/d/1cW-Ni1jSXFdXsWR1J5V51IxOLCnuRZjR=w640-rj-l90
- 106 KB — https://lh3.googleusercontent.com/d/1jEF4_E12YhOEJK5nlggSycqmxH2p23bM=w640-rj-l90
- 95 KB — https://lh3.googleusercontent.com/d/1IhaILHUtunljwD1AGQ_5lCGYIXnq2BcS=w640-rj-l90
- 92 KB — https://lh3.googleusercontent.com/d/1cBoKgI5k1rJyewbF3xrgOcMakRjrLqJ9=w640-rj-l90

**`/experience`** — LCP: `<h2>` "Perusahaan Umum Jasa Tirta 1"
- 12 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641512127/w128.webp
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1781945470536/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641473732/w128.webp
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641486671/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641500247/w128.webp

**`/education`** — LCP: `<h1>` "Academic Journey"
- 14 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474587248/w128.webp
- 11 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474373030/w128.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474575437/w128.webp
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474595374/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w128.webp

**`/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 131 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 6 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w128.webp

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
| `/` | 0.90 s | 1.13 s (4 img) | 18 / 1022 KB | 32 / 1.76 MB | 4/150 | 4 | 32 |
| `/projects` | 1.87 s | 1.47 s (6 img) | 20 / 1.11 MB | 30 / 1.68 MB | 4/30 | 4 | 0 |
| `/certificates` | 1.55 s | 1.11 s (6 img) | 18 / 1.15 MB | 112 / 6.59 MB | 4/112 | 4 | 0 |
| `/experience` | 0.76 s | 0.88 s (5 img) | 10 / 168 KB | 10 / 168 KB | 1/10 | 1 | 0 |
| `/education` | 0.74 s | 0.89 s (5 img) | 6 / 187 KB | 6 / 187 KB | 1/6 | 1 | 0 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 0.84 s | 0.73 s (4 img) | 4 / 220 KB | 4 / 220 KB | 2/4 | 2 | 0 |
| `/admin/projects` | 2.53 s | 2.03 s (2 img) | 16 / 979 KB | 24 / 1.48 MB | 3/24 | 3 | 0 |
| `/admin/certificates` | 1.79 s | 1.99 s (5 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 2.43 s | 1.77 s (1 img) | 1 / 105 KB | 1 / 105 KB | 1/1 | 1 | 0 |
| `/admin/experience` | 2.46 s | 2.32 s (6 img) | 10 / 59 KB | 10 / 59 KB | 0/10 | 0 | 0 |
| `/admin/education` | 2.02 s | 1.92 s (4 img) | 4 / 45 KB | 4 / 45 KB | 0/4 | 0 | 0 |
| `/admin/skills` | 1.76 s | 2.03 s (6 img) | 9 / 30 KB | 9 / 30 KB | 0/9 | 0 | 0 |

<details><summary>Detail LCP & file terbesar</summary>

**`/`** — LCP: `<p>` "Data & AI Specialist with expertise in Data Analytics, Machi"
- 362 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780834384166/w960.webp
- 193 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w960.webp
- 147 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w960.webp
- 131 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 119 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/journey-photo-1780832657816/w960.webp
- oversized 2.7×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp
- oversized 2.7×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp
- oversized 2.7×: natural 128px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp

**`/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 193 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779959848298/w960.webp
- 147 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779805610148/w960.webp
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779806078735/w736.webp
- 131 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 112 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1779724908832/w533.webp

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w960-rj-l90
- 324 KB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w960-rj-l90
- 208 KB — https://lh3.googleusercontent.com/d/1IhaILHUtunljwD1AGQ_5lCGYIXnq2BcS=w960-rj-l90
- 199 KB — https://lh3.googleusercontent.com/d/1cW-Ni1jSXFdXsWR1J5V51IxOLCnuRZjR=w960-rj-l90
- 188 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w960-rj-l90
- 176 KB — https://lh3.googleusercontent.com/d/1jEF4_E12YhOEJK5nlggSycqmxH2p23bM=w960-rj-l90

**`/experience`** — LCP: `<h2>` "Perusahaan Umum Jasa Tirta 1"
- 67 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w640.webp
- 28 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641512127/w256.webp
- 22 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1781945470536/w256.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641473732/w256.webp
- 10 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/exp-logo-1779641486671/w256.webp

**`/education`** — LCP: `<h3>` "University of Muhammadiyah Malang"
- 67 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w640.webp
- 38 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474587248/w256.webp
- 31 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474373030/w256.webp
- 23 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474575437/w256.webp
- 23 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474595374/w256.webp

**`/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68`** — LCP: `<p>` "An end-to-end data analytics and business intelligence proje"
- 131 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w940.webp
- 67 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w640.webp
- 18 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/project-cover-1782301729072/w256.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673/w128.webp

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
- 9 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/edu-logo-1779474595374/w128.webp

**`/admin/skills`** — LCP: `<p>` "Manage technical skills, soft skills, and tools."
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788769813570/w128.webp
- 7 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1782227882388/w128.webp
- 4 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781324791085/w128.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-logo-1781323760886/w100.webp
- 3 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/opt/skill-icon-1788773890317/w128.webp

</details>

## Header gambar yang terlihat

- Cache-Control: `public, max-age=31536000`, `private, max-age=86400, no-transform`
- Content-Type: `image/webp`, `image/jpeg`
