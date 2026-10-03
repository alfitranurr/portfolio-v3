'use client'

// Membuat varian WebP responsif di browser sebelum upload (lihat image-variants.ts).
// Resize bertahap (maks. 2× per langkah) dengan imageSmoothingQuality 'high' agar hasil
// tetap tajam tanpa aliasing. Tidak pernah upscale: varian terbesar = min(lebar asli, 2560px).

import { MAX_IMAGE_WIDTH, VARIANT_QUALITY, availableWidths } from './image-variants'

/** Batas ukuran file input sebelum diproses. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024
/** Batas ukuran satu varian setelah encode (harus <= batas server). */
export const MAX_VARIANT_BYTES = 3.5 * 1024 * 1024
/** Kualitas cadangan bila satu varian masih melebihi MAX_VARIANT_BYTES. */
const FALLBACK_QUALITY = 0.82

const PASSTHROUGH_TYPES = new Set(['image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'])

export interface ImageVariantBlob {
  width: number
  blob: Blob
  ext: 'webp' | 'jpg'
}

export type ProcessedImage =
  | { kind: 'variants'; sourceWidth: number; sourceHeight: number; variants: ImageVariantBlob[] }
  | { kind: 'passthrough'; file: File }

/** SVG / GIF (animasi) / ICO diupload apa adanya. */
export function isPassthroughImage(file: File): boolean {
  return PASSTHROUGH_TYPES.has(file.type) || /\.(svg|gif|ico)$/i.test(file.name)
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

let webpEncodeSupported: Promise<boolean> | undefined
/** Safari belum bisa encode WebP lewat canvas (fallback ke JPEG). */
function supportsWebpEncode(): Promise<boolean> {
  webpEncodeSupported ??= (async () => {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const blob = await canvasToBlob(c, 'image/webp', VARIANT_QUALITY)
    return blob?.type === 'image/webp'
  })()
  return webpEncodeSupported
}

function drawScaled(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  tw: number,
  th: number,
  opaque: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = tw
  canvas.height = th
  const ctx = canvas.getContext('2d', { alpha: !opaque })
  if (!ctx) throw new Error('Canvas 2D tidak tersedia di browser ini.')
  if (opaque) {
    // JPEG tidak punya alpha — isi putih agar area transparan tidak jadi hitam
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tw, th)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, sw, sh, 0, 0, tw, th)
  return canvas
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (isPassthroughImage(file)) return { kind: 'passthrough', file }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 25 MB.`)
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Gambar tidak bisa dibaca. Gunakan JPG, PNG, atau WebP.')
  }

  try {
    const sourceWidth = bitmap.width
    const sourceHeight = bitmap.height
    const maxWidth = Math.min(sourceWidth, MAX_IMAGE_WIDTH)
    const webp = await supportsWebpEncode()
    const type = webp ? 'image/webp' : 'image/jpeg'
    const ext = webp ? 'webp' : 'jpg'

    // Proses dari varian terbesar ke terkecil; tiap varian jadi sumber varian berikutnya
    const widths = availableWidths(maxWidth).sort((a, b) => b - a)
    let source: CanvasImageSource = bitmap
    let cw = sourceWidth
    let ch = sourceHeight
    const variants: ImageVariantBlob[] = []

    for (const width of widths) {
      while (cw >= width * 2) {
        const hw = Math.round(cw / 2)
        const hh = Math.round(ch / 2)
        source = drawScaled(source, cw, ch, hw, hh, false)
        cw = hw
        ch = hh
      }
      const height = Math.max(1, Math.round((sourceHeight * width) / sourceWidth))
      const canvas = drawScaled(source, cw, ch, width, height, !webp)

      let blob = await canvasToBlob(canvas, type, VARIANT_QUALITY)
      if (blob && blob.size > MAX_VARIANT_BYTES) blob = await canvasToBlob(canvas, type, FALLBACK_QUALITY)
      if (!blob) throw new Error('Gagal meng-encode gambar.')
      if (blob.size > MAX_VARIANT_BYTES) throw new Error('Gambar terlalu kompleks untuk dikompres di bawah 3.5 MB.')

      variants.push({ width, blob, ext })
      source = canvas
      cw = width
      ch = height
    }

    return { kind: 'variants', sourceWidth, sourceHeight, variants }
  } finally {
    bitmap.close()
  }
}
