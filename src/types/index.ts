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

export interface WizardState {
  step: number
  productType: ProductType | null
  sizeCode: SizeCode | null
  occasionType: OccasionType | null
  selectedBackground: BackgroundDto | null
  selectedLayoutId: string | null
  customBackgroundUrl: string | null   // blob URL for user-uploaded background
  subjectAssetId: string | null
  subjectPreviewUrl: string | null
  textConfig: TextConfig
}
