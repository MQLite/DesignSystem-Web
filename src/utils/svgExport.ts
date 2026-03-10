import { parse as parseFont } from 'opentype.js'
import type { Font } from 'opentype.js'
import type { CanvasLayout, LayerTransform } from '../types'

// ─── Canvas dimensions (pt at 72 dpi, matching standard PDF page sizes) ───────
const CANVAS: Record<string, [number, number]> = {
  A4: [595, 842],
  A3: [842, 1191],
}

// ─── Convert any URL (blob: or http:) to a base64 data URI ───────────────────
async function urlToDataUri(url: string): Promise<string | null> {
  // Primary: fetch + FileReader (works for blob: URLs and CORS-enabled remote URLs)
  try {
    const res = await fetch(url)
    if (res.ok) {
      const blob = await res.blob()
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  } catch {
    // fall through to canvas fallback
  }

  // Fallback: draw via HTMLImageElement → Canvas → toDataURL
  return new Promise<string | null>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 1
        canvas.height = img.naturalHeight || 1
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ─── Try to load a TTF/OTF font for text-to-path conversion ──────────────────
async function tryLoadFont(fontUrl: string): Promise<Font | null> {
  try {
    const res = await fetch(fontUrl)
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    return parseFont(buffer)
  } catch {
    return null
  }
}

// ─── Escape XML special characters ───────────────────────────────────────────
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Build text SVG elements (paths or <text> fallback) ──────────────────────
interface TextLine {
  content: string
  y: number
  fontSize: number
  fill: string
  fontWeight?: string
}

function buildTextLayer(lines: TextLine[], W: number, font: Font | null): { svg: string; curved: boolean } {
  if (font) {
    const paths = lines
      .filter((l) => l.content.trim())
      .map((l) => {
        const path = font.getPath(l.content, 0, 0, l.fontSize)
        const bb = path.getBoundingBox()
        const textW = bb.x2 - bb.x1
        const x = (W - textW) / 2 - bb.x1
        const movedPath = font.getPath(l.content, x, l.y, l.fontSize)
        return `<path d="${movedPath.toPathData(2)}" fill="${l.fill}"/>`
      })
      .join('\n    ')
    return { svg: paths, curved: true }
  }

  const texts = lines
    .filter((l) => l.content.trim())
    .map(
      (l) =>
        `<text x="${W / 2}" y="${l.y}" text-anchor="middle" font-size="${l.fontSize}" fill="${l.fill}"` +
        (l.fontWeight ? ` font-weight="${l.fontWeight}"` : '') +
        ` font-family="Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif">${esc(l.content)}</text>`,
    )
    .join('\n    ')
  return { svg: texts, curved: false }
}

// ─── Build SVG transform attribute replicating CSS transform-origin: cx cy ───
function svgLayerTransform(l: LayerTransform, tx: number, ty: number, cx: number, cy: number): string {
  // Equivalent of: translate(tx,ty) scale(s) rotate(r) with transform-origin (cx,cy)
  // = translate(cx+tx, cy+ty) rotate(r) scale(s) translate(-cx,-cy)
  if (l.rotation === 0 && l.scale === 1) return `translate(${tx} ${ty})`
  return `translate(${cx + tx} ${cy + ty}) rotate(${l.rotation}) scale(${l.scale}) translate(${-cx} ${-cy})`
}

// ─── Public export options ────────────────────────────────────────────────────
export interface SvgExportOptions {
  backgroundUrl: string | null
  subjectUrl: string | null
  title: string
  subtitle: string
  footer: string
  sizeCode: string | null
  /** Canvas layout from the interactive preview */
  canvasLayout?: CanvasLayout
  /** URL to a TTF/OTF font file for text-to-path conversion, e.g. '/fonts/NotoSansSC-Regular.ttf' */
  fontUrl?: string
}

export interface SvgExportResult {
  /** true if text was converted to curves via font file */
  textCurved: boolean
}

export async function exportSvg(opts: SvgExportOptions): Promise<SvgExportResult> {
  const { backgroundUrl, subjectUrl, title, subtitle, footer, sizeCode } = opts
  const [W, H] = CANVAS[sizeCode ?? 'A4']

  const bg = opts.canvasLayout?.background ?? { x: 0, y: 0, scale: 1, rotation: 0 }
  const subj = opts.canvasLayout?.subject ?? { x: 0, y: 0, scale: 1, rotation: 0 }
  const txt = opts.canvasLayout?.text ?? { x: 0, y: 0, scale: 1, rotation: 0 }

  // Load images in parallel
  const [bgData, subjectData] = await Promise.all([
    backgroundUrl ? urlToDataUri(backgroundUrl) : Promise.resolve(null),
    subjectUrl ? urlToDataUri(subjectUrl) : Promise.resolve(null),
  ])

  // Try to load font for text-to-path
  const font = opts.fontUrl ? await tryLoadFont(opts.fontUrl) : null

  // Background transform (pivot = canvas center)
  const bgTx = Math.round(bg.x * W)
  const bgTy = Math.round(bg.y * H)
  const bgTransform = svgLayerTransform(bg, bgTx, bgTy, W / 2, H / 2)

  // Subject placement (pivot = subject center in canvas)
  const subW = Math.round(W * 0.70 * subj.scale)
  const subH = Math.round(H * 0.58 * subj.scale)
  const subCx = Math.round(W / 2 + subj.x * W)
  const subCy = Math.round(H / 2 + subj.y * H)
  const subjectTransform = subj.rotation !== 0
    ? `translate(${subCx} ${subCy}) rotate(${subj.rotation}) translate(${-subCx} ${-subCy})`
    : ''

  // Text block — bottom of canvas, with optional transform
  const textBaseY = H - Math.round(H * 0.22)   // approx center of text block
  const txtTx = Math.round(txt.x * W)
  const txtTy = Math.round(txt.y * H)
  const textGroupTransform = svgLayerTransform(txt, txtTx, txtTy, W / 2, textBaseY)

  const textLines: TextLine[] = [
    { content: title,    y: H - Math.round(H * 0.13), fontSize: Math.round(W * 0.058), fill: 'white', fontWeight: 'bold' },
    { content: subtitle, y: H - Math.round(H * 0.08), fontSize: Math.round(W * 0.032), fill: 'rgba(255,255,255,0.85)' },
    { content: footer,   y: H - Math.round(H * 0.04), fontSize: Math.round(W * 0.022), fill: 'rgba(255,255,255,0.65)' },
  ]

  const { svg: textSvg, curved } = buildTextLayer(textLines, W, font)

  const gradId = 'g1'
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}"
     viewBox="0 0 ${W} ${H}">

  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
    </linearGradient>
  </defs>

  <!-- Layer 1: Background -->
  <g id="layer-background" transform="${bgTransform}">
${bgData
  ? `    <image xlink:href="${bgData}" href="${bgData}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`
  : `    <rect width="${W}" height="${H}" fill="#e5e7eb"/>`}
  </g>

  <!-- Layer 2: Gradient overlay -->
  <g id="layer-overlay">
    <rect width="${W}" height="${H}" fill="url(#${gradId})"/>
  </g>

  <!-- Layer 3: Subject photo -->
  <g id="layer-subject"${subjectTransform ? ` transform="${subjectTransform}"` : ''}>
${subjectData
  ? `    <image xlink:href="${subjectData}" href="${subjectData}" x="${subCx - subW / 2}" y="${subCy - subH / 2}" width="${subW}" height="${subH}" preserveAspectRatio="xMidYMid meet"/>`
  : '    <!-- No subject photo uploaded -->'}
  </g>

  <!-- Layer 4: Text${curved ? ' (converted to paths / 曲线化)' : ' (text elements)'} -->
  <g id="layer-text" transform="${textGroupTransform}">
    ${textSvg}
  </g>

</svg>`

  // Trigger browser download
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `design-${sizeCode ?? 'A4'}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return { textCurved: curved }
}
