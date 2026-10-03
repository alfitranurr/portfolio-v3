# Pengukuran gambar — baseline

- Waktu: 2026-10-03T18:31:22.986Z
- Target: https://alfitranurr.vercel.app
- Cache browser dimatikan (cold load), intro loader dilewati, visitor tracking diblokir.
- "Awal" = setelah load + jaringan idle tanpa scroll. "Penuh" = setelah scroll sampai bawah.

## Desktop 1440×900, DPR 1, tanpa throttle

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/` | 1.78 s | 6.67 s (10 img) | 29 / 21.77 MB | 29 / 21.77 MB | 10/144 | 0 | 143 |
| `/projects` | 1.75 s | 3.63 s (13 img) | 15 / 9.43 MB | 15 / 9.43 MB | 15/30 | 15 | 25 |
| `/certificates` | 1.95 s | 5.68 s (13 img) | 56 / 19.98 MB | 56 / 19.98 MB | 56/112 | 56 | 111 |
| `/experience` | 0.92 s | 1.37 s (4 img) | 9 / 1.87 MB | 9 / 1.87 MB | 1/10 | 1 | 9 |
| `/education` | 1.05 s | 2.26 s (5 img) | 5 / 3.79 MB | 5 / 3.79 MB | 1/6 | 1 | 5 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 2.21 s | 1.39 s (3 img) | 2 / 1.65 MB | 2 / 1.65 MB | 2/4 | 2 | 1 |

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

**`/projects`** — LCP: `<img>` https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- 1.70 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783969421916.png
- 1.67 MB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1783957201747.png
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 827 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 683 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779959848298.png
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- oversized 7.5×: natural 1920px, tampil 255px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779805188448.png
- oversized 7.5×: natural 1920px, tampil 255px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1779806267253.png

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1fPTybOa_f8EkqgEkA193rAMtVtpsqYEN=w1000
- 1.70 MB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w1000
- 1.13 MB — https://lh3.googleusercontent.com/d/1fPTybOa_f8EkqgEkA193rAMtVtpsqYEN=w1000
- 869 KB — https://lh3.googleusercontent.com/d/1jEF4_E12YhOEJK5nlggSycqmxH2p23bM=w1000
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 847 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w1000
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- oversized 3.9×: natural 1000px, tampil 255px — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w1000
- oversized 3.9×: natural 1000px, tampil 255px — https://lh3.googleusercontent.com/d/16MuYIT6TTifFUIx8ta1j_FvWoymRbhzs=w1000

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
- 826 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- oversized 9.1×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

</details>

## Mobile 412×915, DPR 2.625, 4G (9 Mbps / 60 ms RTT)

| Halaman | LCP | Gambar atas-layar selesai | Gambar awal (req / ukuran) | Gambar penuh (req / ukuran) | `<img>` non-lazy | Preload img | Oversized (>2×) |
|---|---|---|---|---|---|---|---|
| `/` | 1.61 s | 5.60 s (4 img) | 11 / 7.48 MB | 29 / 21.78 MB | 10/144 | 0 | 67 |
| `/projects` | 7.98 s | 9.13 s (6 img) | 16 / 9.45 MB | 16 / 9.45 MB | 15/30 | 15 | 7 |
| `/certificates` | 17.50 s | 17.41 s (6 img) | 57 / 20.00 MB | 57 / 20.00 MB | 56/112 | 56 | 2 |
| `/experience` | 1.16 s | 2.43 s (5 img) | 10 / 1.89 MB | 10 / 1.89 MB | 1/10 | 1 | 10 |
| `/education` | 0.76 s | 3.93 s (5 img) | 6 / 3.81 MB | 6 / 3.81 MB | 1/6 | 1 | 6 |
| `/projects/d02c1f91-b166-4abb-bb97-c0cab8bd8f68` | 0.94 s | 2.27 s (4 img) | 3 / 1.67 MB | 3 / 1.67 MB | 2/4 | 2 | 2 |

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

**`/certificates`** — LCP: `<img>` https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w1000
- 1.70 MB — https://lh3.googleusercontent.com/d/1-oLTarJ7SYHXVrr8HTueDXKd3btQK4wB=w1000
- 1.13 MB — https://lh3.googleusercontent.com/d/1fPTybOa_f8EkqgEkA193rAMtVtpsqYEN=w1000
- 869 KB — https://lh3.googleusercontent.com/d/1jEF4_E12YhOEJK5nlggSycqmxH2p23bM=w1000
- 866 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png
- 847 KB — https://lh3.googleusercontent.com/d/1ik_6_ynwm-Ym8UIV8rX-uaQwrOCXU2nb=w1000
- oversized 8.1×: natural 512px, tampil 24px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 3.5×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

**`/experience`** — LCP: `<p>` "My career trajectory, internships, and leadership roles"
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
- 826 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/project-cover-1782301729072.png
- 21 KB — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 8.1×: natural 512px, tampil 24px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/logo-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1781949887673.png
- oversized 3.5×: natural 1000px, tampil 110px — https://jeibbwndxywzmvugtobq.supabase.co/storage/v1/object/public/portfolio-assets/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031.png

</details>

## Header gambar yang terlihat

- Cache-Control: `public, max-age=3600`, `private, max-age=86400, no-transform`
- Content-Type: `image/png`, `image/jpeg`
