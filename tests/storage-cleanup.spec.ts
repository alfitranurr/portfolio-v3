import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { findOrphanVariantFolders, isFreshUploadUrl, removeFileIfUnused } from '../src/app/admin/actions/_storage'

/**
 * Cleanup file storage lama saat gambar diganti / record dihapus
 * (docs/PERFORMANCE_OPTIMIZATION_PLAN.md Fase 3). Memakai client Supabase palsu:
 * tidak ada request ke Supabase sungguhan.
 */

const BASE = 'https://abc.supabase.co/storage/v1/object/public/portfolio-assets'

function fakeSupabase({ referenced = false, folderFiles = ['w128.webp', 'w256.webp', 'w640.webp'] } = {}) {
  const removed: string[][] = []
  const listed: string[] = []
  const query = () => {
    const q: Record<string, unknown> = {}
    q.select = () => q
    q.eq = () => q
    q.like = () => q
    q.then = (resolve: (v: unknown) => void) => resolve({ count: referenced ? 1 : 0, error: null })
    return q
  }
  const client = {
    from: () => query(),
    storage: {
      from: () => ({
        list: async (folder: string) => {
          listed.push(folder)
          return { data: folderFiles.map((name) => ({ name })), error: null }
        },
        remove: async (paths: string[]) => {
          removed.push(paths)
          return { data: null, error: null }
        },
      }),
    },
  }
  return { client: client as unknown as SupabaseClient, removed, listed }
}

test.describe('storage cleanup (removeFileIfUnused)', () => {
  test('removes the whole variant folder when no row references it', async () => {
    const { client, removed, listed } = fakeSupabase()
    await removeFileIfUnused(client, `${BASE}/opt/project-cover-1783969421916/w640.webp`, `${BASE}/opt/project-cover-1789999999999/w2560.webp`)
    expect(listed).toEqual(['opt/project-cover-1783969421916'])
    expect(removed).toEqual([[
      'opt/project-cover-1783969421916/w128.webp',
      'opt/project-cover-1783969421916/w256.webp',
      'opt/project-cover-1783969421916/w640.webp',
    ]])
  })

  test('removes a single legacy (non-variant) file', async () => {
    const { client, removed } = fakeSupabase()
    await removeFileIfUnused(client, `${BASE}/edu-logo-1779474595374.png`, null)
    expect(removed).toEqual([['edu-logo-1779474595374.png']])
  })

  test('keeps files that are still referenced elsewhere', async () => {
    const { client, removed } = fakeSupabase({ referenced: true })
    await removeFileIfUnused(client, `${BASE}/opt/exp-logo-1779641473732/w1080.webp`, null)
    expect(removed).toEqual([])
  })

  test('ignores unchanged URLs, other variants of the same image, and external hosts', async () => {
    const { client, removed } = fakeSupabase()
    const url = `${BASE}/opt/avatar-1790000000000/w1000.webp`
    await removeFileIfUnused(client, url, url)
    await removeFileIfUnused(client, url, `${BASE}/opt/avatar-1790000000000/w256.webp`)
    await removeFileIfUnused(client, 'https://lh3.googleusercontent.com/d/AbC_123=w1000', null)
    await removeFileIfUnused(client, null, null)
    expect(removed).toEqual([])
  })
})

test.describe('unsaved upload cleanup', () => {
  test('only fresh admin uploads are accepted for discard', () => {
    expect(isFreshUploadUrl(`${BASE}/opt/photo-gallery-1790000000000/w2560.webp`)).toBe(true)
    expect(isFreshUploadUrl(`${BASE}/opt/avatar-1790000000000/w1000.jpg`)).toBe(true)
    expect(isFreshUploadUrl(`${BASE}/logo-1790000000000.svg`)).toBe(true)
    // Backup file asli migrasi & folder hasil migrasi (nama file lama) tidak boleh dibuang lewat jalur ini
    expect(isFreshUploadUrl(`${BASE}/project-cover-1779959848298.png`)).toBe(false)
    expect(isFreshUploadUrl(`${BASE}/opt/avatar-fff443ef-1b4a-4f81-90e2-651d0cf3e3fd-1779470240031/w1000.webp`)).toBe(false)
    expect(isFreshUploadUrl('https://lh3.googleusercontent.com/d/AbC_123=w1000')).toBe(false)
    expect(isFreshUploadUrl(null)).toBe(false)
  })

  function fakeBucket({ rows, folders, failTable }: {
    rows: Record<string, Record<string, string | null>[]>
    folders: Record<string, { name: string; created_at: string; size: number }[]>
    failTable?: string
  }) {
    const client = {
      from: (table: string) => ({
        select: async () =>
          table === failTable ? { data: null, error: { message: 'boom' } } : { data: rows[table] ?? [], error: null },
      }),
      storage: {
        from: () => ({
          list: async (prefix: string) => {
            if (prefix === 'opt') return { data: Object.keys(folders).map((name) => ({ name, id: null })), error: null }
            const key = prefix.replace('opt/', '')
            return {
              data: (folders[key] ?? []).map((f) => ({ id: f.name, name: f.name, created_at: f.created_at, metadata: { size: f.size } })),
              error: null,
            }
          },
        }),
      },
    }
    return client as unknown as SupabaseClient
  }

  const old = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  const fresh = new Date(Date.now() - 1 * 3600 * 1000).toISOString()

  test('finds unreferenced variant folders older than 24h and keeps referenced / recent ones', async () => {
    const client = fakeBucket({
      rows: {
        photos: [{ image_url: `${BASE}/opt/photo-gallery-1790000000001/w2560.webp` }],
        projects: [{ cover_image: null, content: `![chart](${BASE}/opt/project-cover-1790000000002/w1280.webp)` }],
      },
      folders: {
        'photo-gallery-1790000000001': [{ name: 'w2560.webp', created_at: old, size: 500 }],
        'project-cover-1790000000002': [{ name: 'w1280.webp', created_at: old, size: 400 }],
        'photo-gallery-1790000000003': [
          { name: 'w128.webp', created_at: old, size: 10 },
          { name: 'w640.webp', created_at: old, size: 90 },
        ],
        'avatar-1790000000004': [{ name: 'w256.webp', created_at: fresh, size: 50 }],
      },
    })
    const orphans = await findOrphanVariantFolders(client)
    expect(orphans.map((o) => o.key)).toEqual(['photo-gallery-1790000000003'])
    expect(orphans[0].paths).toEqual(['opt/photo-gallery-1790000000003/w128.webp', 'opt/photo-gallery-1790000000003/w640.webp'])
    expect(orphans[0].bytes).toBe(100)
  })

  test('aborts (throws) instead of deleting when a reference query fails', async () => {
    const client = fakeBucket({
      rows: {},
      folders: { 'photo-gallery-1790000000003': [{ name: 'w128.webp', created_at: old, size: 10 }] },
      failTable: 'skills',
    })
    await expect(findOrphanVariantFolders(client)).rejects.toThrow(/skills/)
  })
})
