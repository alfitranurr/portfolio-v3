import { flushSync } from 'react-dom'

/**
 * Ganti tema dengan transisi halus.
 * - Perangkat ber-mouse: lingkaran menyebar dari tombol toggle (View Transitions API).
 * - Layar sentuh: crossfade warna. Safari iOS memotret panel kaca (backdrop-filter) sebagai
 *   bidang abu-abu datar selama view transition, jadi efek lingkaran terlihat kusam di HP.
 * - prefers-reduced-motion: ganti langsung tanpa animasi.
 */
export function switchTheme(next: string, setTheme: (theme: string) => void, origin?: HTMLElement | null) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTheme(next)
    return
  }

  const canReveal = !!document.startViewTransition && !!origin && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!canReveal) {
    const root = document.documentElement
    root.classList.add('theme-fade')
    // flushSync: class tema langsung berganti di tap yang sama, jadi fade 0.35s selesai sebelum class dicabut
    flushSync(() => setTheme(next))
    // Hitung mundur dari frame pertama sesudah render ulang (saat fade benar-benar mulai), bukan dari tap
    requestAnimationFrame(() => window.setTimeout(() => root.classList.remove('theme-fade'), 400))
    return
  }

  const rect = origin.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  // Jarak ke sudut viewport terjauh supaya lingkaran menutup seluruh layar
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  // next-themes menerapkan class di useEffect; flushSync memastikan DOM sudah berganti sebelum snapshot "new"
  const transition = document.startViewTransition(() => flushSync(() => setTheme(next)))
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
    )
  })
}
