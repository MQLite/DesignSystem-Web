import type { BackgroundDto, ComposePreviewRequest, ComposePreviewResponse, ComposeExportResponse } from '../types'

export async function getBackgrounds(): Promise<BackgroundDto[]> {
  const res = await fetch('/api/backgrounds')
  if (!res.ok) throw new Error(`GET /backgrounds failed: ${res.status}`)
  return res.json()
}
 
export async function composePreview(req: ComposePreviewRequest): Promise<ComposePreviewResponse> {
  const res = await fetch('/api/compose/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`POST /compose/preview failed: ${res.status}`)
  return res.json()
}

export async function composeExportSvg(req: ComposePreviewRequest): Promise<ComposeExportResponse> {
  const res = await fetch('/api/compose/export/svg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`POST /compose/export/svg failed: ${res.status}`)
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
