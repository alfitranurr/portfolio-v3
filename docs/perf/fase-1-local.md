# Pengukuran gambar — fase-1-local

- Waktu: 2026-10-03T19:48:14.024Z
- Target: http://localhost:3200
- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.
- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.

## Desktop 1440×900, DPR 1, tanpa throttle

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/` | 0.90 s | 7.48 s (10 img) | 29 / 21.77 MB | 29 / 21.77 MB | 4/146 | 4 | 145 |
| `/projects` | 1.72 s | 1.99 s (13 img) | 15 / 9.43 MB | 15 / 9.43 MB | 4/30 | 4 | 25 |
| `/certificates` | 2.02 s | 1.64 s (13 img) | 49 / 2.41 MB | 111 / 4.35 MB | 4/112 | 4 | 1 |
| `/experience` | 0.56 s | 0.73 s (4 img) | 9 / 1.87 MB | 9 / 1.87 MB | 1/10 | 1 | 9 |
| `/education` | 0.48 s | 1.59 s (5 img) | 5 / 3.79 MB | 5 / 3.79 MB | 1/6 | 1 | 5 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 1.95 s | 1.34 s (3 img) | 2 / 1.65 MB | 2 / 1.65 MB | 2/4 | 2 | 1 |
| `/admin/projects` | 3.60 s | 3.84 s (12 img) | 12 / 8.11 MB | 12 / 8.11 MB | 3/24 | 3 | 20 |
| `/admin/certificates` | 1.69 s | 1.18 s (9 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 2.23 s | 1.59 s (1 img) | 1 / 1.93 MB | 1 / 1.93 MB | 1/1 | 1 | 1 |
| `/admin/experience` | 1.59 s | 1.19 s (8 img) | 10 / 1.61 MB | 10 / 1.61 MB | 0/10 | 0 | 10 |
| `/admin/education` | 1.64 s | 1.64 s (4 img) | 4 / 2.95 MB | 4 / 2.95 MB | 0/4 | 0 | 4 |
| `/admin/skills` | 1.42 s | 1.38 s (8 img) | 9 / 133 KB | 9 / 133 KB | 0/9 | 0 | 6 |

<details><summary>Detail LCP & file terbesar</summary>

**`/`** — LCP: `<p>` "Data & AI Specialist with expertise in Data Analytics, Machi"
- 8.27 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780834384166.jpg
- 2.49 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832657816.jpg
- 1.93 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- oversized 95.2×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 95.2×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 95.2×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png

**`/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783966817796.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 826 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 684 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- oversized 7.5×: natural 1920px, tampil 255px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 7.5×: natural 1920px, tampil 255px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779806267253.png

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1UrD8tFeMWqiw-noMnPkDMe4LILSQph7W=w640-rj-l90
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 185 KB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w640-rj-l90
- 107 KB — https://lh3.googleusercontent.com/d/1cW-Ni1jSXFdXsWR1J5V51IxOLCnuRZjR=w640-rj-l90
- 106 KB — https://lh3.googleusercontent.com/d/1jEF4_E12YhOEJK5nlggSycqmxH2p23bM=w640-rj-l90
- 95 KB — https://lh3.googleusercontent.com/d/1IhaILHUtunljwD1AGQ_5lCGYIXnq2BcS=w640-rj-l90
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

**`/experience`** — LCP: `<h2>` "Perusahaan Umum Jasa Tirta 1"
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 480 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641512127.png
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png
- 129 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641486671.png
- 90 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png
- oversized 37×: natural 2000px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1786547400588.png
- oversized 20×: natural 1080px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png
- oversized 20×: natural 1080px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png

**`/education`** — LCP: `<h1>` "Academic Journey"
- 932 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474595374.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 835 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- 752 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- 500 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png
- oversized 18.5×: natural 1000px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- oversized 18.5×: natural 1000px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- oversized 18.5×: natural 1000px, tampil 54px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png

**`/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 683 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- 676 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783966817796.png
- oversized 6.8×: natural 1920px, tampil 281px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 6.6×: natural 1852px, tampil 281px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779721302988.png
- oversized 6.2×: natural 1920px, tampil 309px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png

**`/admin/certificates`** — LCP: `<h1>` "Certificates & Awards"
- 7 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w128-rj-l90
- 6 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1EPePD0fPPPIVPzwVQvT7DHMimiad4mTn=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1pMX745hZLAizcyz662x2WcgZCTZWmcqo=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w128-rj-l90

**`/admin/photos`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- 1.93 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- oversized 17.4×: natural 4032px, tampil 232px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg

**`/admin/experience`** — LCP: `<p>` "Manage professional experience, committee roles, and organiz"
- 480 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641512127.png
- 417 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641590707.png
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png
- 129 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641486671.png
- 119 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1781953206712.jpg
- oversized 52.6×: natural 2000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1786547400588.png
- oversized 28.4×: natural 1080px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1781952196752.jpeg
- oversized 28.4×: natural 1080px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png

**`/admin/education`** — LCP: `<p>` "Manage academic background, degrees, certifications, and edu"
- 932 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474595374.png
- 835 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- 752 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- 501 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png
- oversized 26.3×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- oversized 26.3×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- oversized 26.3×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png

**`/admin/skills`** — LCP: `<p>` "Manage technical skills, soft skills, and tools."
- 55 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788769813570.png
- 39 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- 19 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788773890317.png
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1781324791085.png
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1781323760886.png
- oversized 45.1×: natural 1713px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 41.7×: natural 1583px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788769813570.png
- oversized 35.8×: natural 1360px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788773890317.png

</details>

## Mobile 412×915, DPR 2.625, 4G (9 Mbps / 60 ms RTT)

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/` | 1.02 s | 5.49 s (4 img) | 10 / 7.24 MB | 29 / 21.78 MB | 4/146 | 4 | 69 |
| `/projects` | 5.95 s | 7.39 s (6 img) | 11 / 7.63 MB | 16 / 9.45 MB | 4/30 | 4 | 7 |
| `/certificates` | 2.15 s | 2.50 s (6 img) | 18 / 1.95 MB | 112 / 7.39 MB | 4/112 | 4 | 2 |
| `/experience` | 0.89 s | 2.46 s (5 img) | 10 / 1.89 MB | 10 / 1.89 MB | 1/10 | 1 | 10 |
| `/education` | 1.28 s | 4.18 s (5 img) | 6 / 3.81 MB | 6 / 3.81 MB | 1/6 | 1 | 6 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 0.94 s | 2.28 s (4 img) | 3 / 1.67 MB | 3 / 1.67 MB | 2/4 | 2 | 2 |
| `/admin/projects` | 5.16 s | 4.66 s (2 img) | 8 / 6.28 MB | 12 / 8.11 MB | 3/24 | 3 | 2 |
| `/admin/certificates` | 1.31 s | 1.36 s (5 img) | 12 / 55 KB | 12 / 55 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 4.10 s | 2.82 s (1 img) | 1 / 1.93 MB | 1 / 1.93 MB | 1/1 | 1 | 1 |
| `/admin/experience` | 1.40 s | 1.97 s (6 img) | 10 / 1.61 MB | 10 / 1.61 MB | 0/10 | 0 | 10 |
| `/admin/education` | 1.94 s | 3.86 s (4 img) | 4 / 2.95 MB | 4 / 2.95 MB | 0/4 | 0 | 4 |
| `/admin/skills` | 2.21 s | 1.72 s (6 img) | 9 / 133 KB | 9 / 133 KB | 0/9 | 0 | 5 |

<details><summary>Detail LCP & file terbesar</summary>

**`/`** — LCP: `<p>` "Data & AI Specialist with expertise in Data Analytics, Machi"
- 8.27 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780834384166.jpg
- 2.49 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832657816.jpg
- 1.93 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- oversized 36.3×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 36.3×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 36.3×: natural 1713px, tampil 18px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png

**`/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 683 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- oversized 8.1×: natural 512px, tampil 24px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 3.5×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- oversized 2.2×: natural 1920px, tampil 328px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w960-rj-l90
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 324 KB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w960-rj-l90
- 208 KB — https://lh3.googleusercontent.com/d/1IhaILHUtunljwD1AGQ_5lCGYIXnq2BcS=w960-rj-l90
- 199 KB — https://lh3.googleusercontent.com/d/1cW-Ni1jSXFdXsWR1J5V51IxOLCnuRZjR=w960-rj-l90
- 188 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w960-rj-l90
- oversized 8.1×: natural 512px, tampil 24px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 3.5×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

**`/experience`** — LCP: `<h2>` "Perusahaan Umum Jasa Tirta 1"
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 480 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641512127.png
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png
- 129 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641486671.png
- 90 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png
- oversized 16.6×: natural 2000px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1786547400588.png
- oversized 8.9×: natural 1080px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png
- oversized 8.9×: natural 1080px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png

**`/education`** — LCP: `<h3>` "University of Muhammadiyah Malang"
- 932 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474595374.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 835 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- 752 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- 500 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png
- oversized 8.3×: natural 1000px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- oversized 8.3×: natural 1000px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- oversized 8.3×: natural 1000px, tampil 46px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png

**`/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68`** — LCP: `<p>` "An end-to-end data analytics and business intelligence proje"
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 21 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 8.1×: natural 512px, tampil 24px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 3.5×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 684 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- 676 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783966817796.png
- oversized 2.1×: natural 1920px, tampil 344px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 2.1×: natural 1852px, tampil 344px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779721302988.png

**`/admin/certificates`** — LCP: `<p>` "Manage professional certifications, competition awards, and "
- 7 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w128-rj-l90
- 6 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1EPePD0fPPPIVPzwVQvT7DHMimiad4mTn=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/1pMX745hZLAizcyz662x2WcgZCTZWmcqo=w128-rj-l90
- 5 KB — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w128-rj-l90

**`/admin/photos`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- 1.93 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg
- oversized 4.1×: natural 4032px, tampil 378px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/journey-photo-1780832424518.jpg

**`/admin/experience`** — LCP: `<p>` "Manage professional experience, committee roles, and organiz"
- 480 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641512127.png
- 417 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641590707.png
- 143 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641500247.png
- 129 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641486671.png
- 119 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1781953206712.jpg
- oversized 20.1×: natural 2000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1786547400588.png
- oversized 10.8×: natural 1080px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1781952196752.jpeg
- oversized 10.8×: natural 1080px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/exp-logo-1779641473732.png

**`/admin/education`** — LCP: `<p>` "Manage academic background, degrees, certifications, and edu"
- 932 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474595374.png
- 835 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- 752 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- 500 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png
- oversized 10×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474373030.png
- oversized 10×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474587248.png
- oversized 10×: natural 1000px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png

**`/admin/skills`** — LCP: `<p>` "Manage technical skills, soft skills, and tools."
- 55 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788769813570.png
- 39 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- 19 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788773890317.png
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1781324791085.png
- 5 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1781323760886.png
- oversized 17.2×: natural 1713px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-logo-1782227882388.png
- oversized 15.9×: natural 1583px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788769813570.png
- oversized 13.6×: natural 1360px, tampil 38px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/skill-icon-1788773890317.png

</details>

## Header gambar yang terlihat

- Cache-Control: `public, max-age=3600`, `private, max-age=86400, no-transform`
- Content-Type: `image/png`, `image/jpeg`
