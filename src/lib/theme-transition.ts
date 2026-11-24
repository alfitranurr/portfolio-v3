import { flushSync } from 'react-dom'

/**
 * Ganti tema dengan efek lingkaran yang menyebar dari tombol toggle (View Transitions API).
 * Browser tanpa dukungan / prefers-reduced-motion → ganti tema langsung tanpa animasi.
 */
export function switchTheme(next: string, setTheme: (theme: string) => void, origin?: HTMLElement | null) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion || !origin) {
    setTheme(next)
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
