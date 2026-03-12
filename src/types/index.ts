export type ProductType = 'TShirt' | 'PullUpBanner' | 'PvcBanner'
export type SizeCode = 'A3' | 'A4'
export type OccasionType = 'Funeral' | 'Birthday' | 'Others'

export interface BackgroundLayout {
  id: string
  sizeCode: string
  orientation: string
  subjectSlotsJson: string
  textZonesJson: string
  version: number
}

export interface BackgroundDto {
  id: string
  name: string
  occasionType: string
  previewPath: string | null
  sourcePath: string | null
  layout: BackgroundLayout[]
}

export interface TextConfig {
  title: string
  subtitle: string
  footer: string
}

export interface LayerTransform {
  /** Horizontal offset as fraction of canvas width (0 = no offset from default position) */
  x: number
  /** Vertical offset as fraction of canvas height (0 = no offset from default position) */
  y: number
  /** Size multiplier (1.0 = 100%) */
  scale: number
  /** Rotation in degrees */
  rotation: number
}

export interface CanvasLayout {
  background: LayerTransform
  subject: LayerTransform
  text: LayerTransform
}

export const DEFAULT_LAYER: LayerTransform = { x: 0, y: 0, scale: 1.0, rotation: 0 }

export const DEFAULT_CANVAS_LAYOUT: CanvasLayout = {
  background: { ...DEFAULT_LAYER },
  subject: { ...DEFAULT_LAYER },
  text: { ...DEFAULT_LAYER },
}

// ── Compose API types ─────────────────────────────────────────────────────────

export interface ComposePreviewRequest {
  backgroundLayoutId: string
  subjectAssetId?: string
  textConfigJson: string
  /** Serialised CanvasLayout — per-layer x/y/scale/rotation adjustments */
  canvasLayoutJson: string
}

export interface ComposePreviewResponse {
  previewRelativePath: string
  widthPx: number
  heightPx: number
}

export interface ComposeExportResponse {
  exportRelativePath: string
  widthPx: number
  heightPx: number
}

export interface WizardState {
  step: number
  productType: ProductType | null
  sizeCode: SizeCode | null
  occasionType: OccasionType | null
  selectedBackground: BackgroundDto | null
  selectedLayoutId: string | null
  customBackgroundUrl: string | null
  subjectAssetId: string | null
  subjectPreviewUrl: string | null
  textConfig: TextConfig
  canvasLayout: CanvasLayout
}
