'use client'

// Custom loader next/image (lihat images.loaderFile di next.config.ts).
// Tidak memakai /_next/image, jadi kuota Vercel Image Optimization tidak terpakai.
// Lebar diterjemahkan ke varian yang sudah dibuat saat upload (lihat image-variants.ts),
// atau ke parameter ukuran Google Drive / Unsplash.

import { variantUrl } from './image-variants'

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  return variantUrl(src, width)
}
