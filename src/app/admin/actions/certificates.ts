'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Certificate } from '@/lib/types'
import { hasSupabaseConfig } from './_shared'

export async function saveCertificateAction(certData: Partial<Certificate>) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    let list = mockCertStr ? JSON.parse(mockCertStr) : null

    if (!list) {
      const { MOCK_CERTIFICATES } = await import('@/lib/data-service')
      list = MOCK_CERTIFICATES
    }

    if (certData.id && certData.id.startsWith('mock-') || list.some((c: Certificate) => c.id === certData.id)) {
      list = list.map((c: Certificate) => c.id === certData.id ? { ...c, ...certData, updated_at: new Date().toISOString() } : c)
    } else {
      const newCert = {
        ...certData,
        id: `mock-cert-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      list.push(newCert)
    }

    cookieStore.set('mock_certificates', JSON.stringify(list), { path: '/' })
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true, message: 'Certificate saved successfully (Mock Mode).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const isEdit = !!certData.id && !certData.id.startsWith('mock-')

    const dbPayload = {
      title: certData.title || '',
      issuer: certData.issuer || '',
      issue_date: certData.issue_date || '',
      credential_url: certData.credential_url || null,
      credential_id: certData.credential_id || null,
      category: certData.category || 'license_certification',
      image_url: certData.image_url || null,
      updated_at: new Date().toISOString()
    }

    let error
    if (isEdit) {
      const { error: err } = await supabase
        .from('certificates')
        .update(dbPayload)
        .eq('id', certData.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('certificates')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
      error = err
    }

    if (error) throw error

    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true, message: 'Certificate saved successfully.' }
  } catch (err) {
    console.error('saveCertificateAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function deleteCertificateAction(id: string) {
  const cookieStore = await cookies()
  if (!hasSupabaseConfig()) {
    const mockCertStr = cookieStore.get('mock_certificates')?.value
    if (mockCertStr) {
      const list = JSON.parse(mockCertStr)
      const updated = list.filter((c: Certificate) => c.id !== id)
      cookieStore.set('mock_certificates', JSON.stringify(updated), { path: '/' })
    }
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true }
  }

  if (id.startsWith('mock-')) {
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)
    if (error) throw error
    revalidatePath('/certificates')
    revalidatePath('/admin/certificates')
    return { success: true }
  } catch (err) {
    console.error('deleteCertificateAction error:', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
