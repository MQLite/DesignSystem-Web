import type { BackgroundDto } from '../types'

export async function getBackgrounds(): Promise<BackgroundDto[]> {
  const res = await fetch('/api/backgrounds')
  if (!res.ok) throw new Error(`GET /backgrounds failed: ${res.status}`)
  return res.json()
}
 
export async function uploadSubject(
  file: File,
): Promise<{ subjectAssetId: string; originalPath: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/subject/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error(`POST /subject/upload failed: ${res.status}`)
  return res.json()
}
