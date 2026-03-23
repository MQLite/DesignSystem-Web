export type ProductType = 'TShirt' | 'PullUpBanner' | 'PvcBanner'
export type SizeCode = 'A3' | 'A4'
export type OccasionType = 'Funeral' | 'Birthday' | 'Others'

export interface BackgroundLayout {
  id: string
  sizeCode: string
  widthMm: number
  heightMm: number
  orientation: string
  subjectSlotsJson: string
  textZonesJson: string | null
  version: number
}

// ── Subject slot + crop types ─────────────────────────────────────────────────

/**
 * One slot parsed from BackgroundLayout.subjectSlotsJson.
 * Defines where and how the subject image is placed on the final canvas.
 * All coordinates are normalised 0..1 (fraction of canvas width/height).
 * The slot rect also serves as the crop viewport — aspect ratio = w / h.
 */
export interface SubjectSlot {
  id: string
  x: number
  y: number
  w: number
  h: number
  anchor?: string
  fitMode?: string
  allowUserMove: boolean
  allowUserScale: boolean
  minScale?: number
  maxScale?: number
}

/**
 * One entry in DesignProject.SubjectCropStateJson — records how the user has
 * panned / zoomed the subject photo within a specific slot's crop viewport.
 * slotId references SubjectSlot.id.
 * offsetX / offsetY are normalised (fraction of slot size, 0 = centred).
 * scale is a multiplier applied on top of the "cover" fitted size.
 */
export interface SubjectCropState {
  slotId: string
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

/** Text content keyed by zone id (dynamic — matches the template's textZonesJson). */
export type TextConfig = Record<string, string>

/**
 * One text zone parsed from BackgroundLayout.textZonesJson.
 * Coordinates are normalised 0..1 (fraction of canvas width/height).
 */
export interface TextZone {
  id: string
  x: number
  y: number
  w: number
  h: number
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

// ── Project API types ─────────────────────────────────────────────────────────

export interface ProjectDetail {
  id: string
  backgroundLayoutId: string
  subjectAssetId: string | null
  productType: string
  occasionType: string
  textConfig: { title: string; subtitle: string; footer: string }
  canvasLayout: CanvasLayout | null
  subjectCropStates: SubjectCropState[] | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  backgroundLayoutId: string
  subjectAssetId?: string
  productType: string
  occasionType: string
}

export interface UpdateProjectTextRequest {
  title: string
  subtitle: string
  footer: string
}

export interface UpdateProjectCropRequest {
  cropStates: SubjectCropState[]
}

export interface UpdateProjectAdjustmentsRequest {
  layout: CanvasLayout
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
