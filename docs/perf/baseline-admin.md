# Pengukuran gambar — baseline-admin

- Waktu: 2026-10-03T18:41:13.200Z
- Target: https://alfitranurr.vercel.app
- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.
- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.

## Desktop 1440×900, DPR 1, tanpa throttle

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/admin/projects` | 4.17 s | 3.49 s (12 img) | 12 / 8.11 MB | 12 / 8.11 MB | 12/24 | 12 | 20 |
| `/admin/certificates` | 2.52 s | 3.10 s (9 img) | 12 / 217 KB | 12 / 217 KB | 0/12 | 0 | 12 |
| `/admin/photos` | 3.05 s | 2.12 s (1 img) | 1 / 1.93 MB | 1 / 1.93 MB | 1/1 | 1 | 1 |
| `/admin/experience` | 2.37 s | 3.35 s (8 img) | 10 / 1.61 MB | 10 / 1.61 MB | 0/10 | 0 | 10 |
| `/admin/education` | 2.96 s | 3.34 s (4 img) | 4 / 2.95 MB | 4 / 2.95 MB | 0/4 | 0 | 4 |
| `/admin/skills` | 1.88 s | 2.06 s (8 img) | 9 / 133 KB | 9 / 133 KB | 0/9 | 0 | 6 |

<details><summary>Detail LCP & file terbesar</summary>

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 683 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- 677 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783966817796.png
- oversized 6.8×: natural 1920px, tampil 281px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 6.6×: natural 1852px, tampil 281px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779721302988.png
- oversized 6.2×: natural 1920px, tampil 309px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png

**`/admin/certificates`** — LCP: `<h1>` "Certificates & Awards"
- 28 KB — https://lh3.googleusercontent.com/d/1fPTybOa_f8EkqgEkA193rAMtVtpsqYEN=w150
- 24 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w150
- 24 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w150
- 23 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w150
- 20 KB — https://lh3.googleusercontent.com/d/1YmIY-BMUP5urkUWnqF84xq7PSgxe0nzL=w150
- oversized 3.9×: natural 150px, tampil 38px — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w150
- oversized 3.9×: natural 150px, tampil 38px — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w150
- oversized 3.9×: natural 150px, tampil 38px — https://lh3.googleusercontent.com/d/1iMhbodbh6-UsPunH-Td6id8Zl-hK9Tp1=w150

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
| `/admin/projects` | 5.27 s | 4.61 s (2 img) | 12 / 8.11 MB | 12 / 8.11 MB | 12/24 | 12 | 2 |
| `/admin/certificates` | 2.13 s | 1.89 s (5 img) | 12 / 217 KB | 12 / 217 KB | 0/12 | 0 | 0 |
| `/admin/photos` | 4.47 s | 3.03 s (1 img) | 1 / 1.93 MB | 1 / 1.93 MB | 1/1 | 1 | 1 |
| `/admin/experience` | 2.17 s | 2.70 s (6 img) | 10 / 1.61 MB | 10 / 1.61 MB | 0/10 | 0 | 10 |
| `/admin/education` | 1.88 s | 4.79 s (4 img) | 4 / 2.95 MB | 4 / 2.95 MB | 0/4 | 0 | 4 |
| `/admin/skills` | 1.71 s | 2.02 s (6 img) | 9 / 133 KB | 9 / 133 KB | 0/9 | 0 | 5 |

<details><summary>Detail LCP & file terbesar</summary>

**`/admin/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 684 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- 677 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783966817796.png
- oversized 2.1×: natural 1920px, tampil 344px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 2.1×: natural 1852px, tampil 344px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779721302988.png

**`/admin/certificates`** — LCP: `<p>` "Manage professional certifications, competition awards, and "
- 28 KB — https://lh3.googleusercontent.com/d/1fPTybOa_f8EkqgEkA193rAMtVtpsqYEN=w150
- 24 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w150
- 24 KB — https://lh3.googleusercontent.com/d/1eMT0xpnsftuqjlcj5fHpgnCkBqY4Y-sh=w150
- 23 KB — https://lh3.googleusercontent.com/d/1Hhe9Tedpxw7uH3b7glPRshG-oKdxJcYF=w150
- 20 KB — https://lh3.googleusercontent.com/d/1YmIY-BMUP5urkUWnqF84xq7PSgxe0nzL=w150

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
- 501 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/edu-logo-1779474575437.png
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
