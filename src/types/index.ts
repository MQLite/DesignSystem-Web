export type ProductType = 'TShirt' | 'PullUpBanner' | 'PvcBanner'
export type SizeCode = 'A3' | 'A4'
export type OccasionType = 'Funeral' | 'Birthday' | 'Others'

export interface BackgroundLayout {
  id: string
  sizeCode: string
  orientation: string
  subjectSlotsJson: string
  /** Crop frame definition(s) for the subject image. Null when the template has no crop frame. */
  subjectCropFramesJson: string | null
  textZonesJson: string | null
  version: number
}

// ── Subject crop types ────────────────────────────────────────────────────────

/**
 * Defines a single crop window on the canvas (from BackgroundLayout.subjectCropFramesJson).
 * All coordinates are normalised 0..1 (fraction of canvas width/height).
 * Parse from subjectCropFramesJson as SubjectCropFrame[].
 */
export interface SubjectCropFrame {
  /** Stable id referenced by SubjectCropState entries. */
  id: string
  /** Crop window position on canvas (normalised 0..1). */
  x: number
  y: number
  w: number
  h: number
  /** "rect" | "circle" | "oval" */
  shape: string
  /** Optional locked aspect ratio (width / height). Null = free. */
  aspectRatio: number | null
  allowUserMove: boolean
  allowUserScale: boolean
}

/**
 * One entry in DesignProject.SubjectCropStateJson — records how the user has
 * panned / zoomed the subject photo within a specific crop frame.
 * offsetX / offsetY are normalised (fraction of crop frame size).
 * scale is a multiplier applied on top of the fitted size.
 * TODO: persist in WizardState and send to compose API once the crop UI is built.
 */
export interface SubjectCropState {
  cropFrameId: string
  offsetX: number
  offsetY: number
  scale: number
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
  /** Each text segment is an independent draggable/scalable layer */
  title: LayerTransform
  subtitle: LayerTransform
  footer: LayerTransform
}

export const DEFAULT_LAYER: LayerTransform = { x: 0, y: 0, scale: 1.0, rotation: 0 }

export const DEFAULT_CANVAS_LAYOUT: CanvasLayout = {
  background: { ...DEFAULT_LAYER },
  subject: { ...DEFAULT_LAYER },
  title: { ...DEFAULT_LAYER },
  subtitle: { ...DEFAULT_LAYER },
  footer: { ...DEFAULT_LAYER },
}

// ── Compose API types ─────────────────────────────────────────────────────────

export interface ComposePreviewRequest {
  backgroundLayoutId: string
  subjectAssetId?: string
  textConfigJson: string
  /** Serialised CanvasLayout — per-layer x/y/scale/rotation adjustments */
  canvasLayoutJson: string
  /** Serialised SubjectCropState[] — user's pan/zoom within each crop frame. Omit when empty. */
  subjectCropStateJson?: string
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
  /** User's crop pan/zoom adjustments, one entry per crop frame id. Empty when not yet adjusted. */
  subjectCropStates: SubjectCropState[]
}
