const en = {
  canvas: {
    layers: 'Layers',
    layer: {
      background: 'Background',
      subject: 'Subject',
      text: 'Text',
    },
    scale: 'Scale',
    rotation: 'Rotation',
    reset: 'Reset Layer',
  },

  app: {
    title: 'Design Studio',
    subtitle: 'Memorial Product Designer',
    poc: 'PoC v0.1',
    autosave: 'Draft auto-saved',
    flow: 'Design Flow',
  },

  nav: {
    back: '← Back',
    next: 'Next →',
    lastStep: 'Last step reached',
    stepOf: 'Step {{current}} / {{total}}',
  },

  steps: {
    productType: 'Product Type',
    size: 'Size',
    occasion: 'Occasion',
    background: 'Background',
    subject: 'Subject Photo',
    textConfig: 'Text',
    preview: 'Preview & Export',
  },

  common: {
    selected: 'Selected',
    inputPlaceholder: 'Enter text…',
  },

  step1: {
    hint: 'Choose the product type. Subsequent steps will adapt accordingly.',
    tshirt: {
      label: 'T-Shirt',
      desc: 'Memorial T-shirt, ideal for gatherings and commemorations',
      dims: 'Front approx. 30 × 40 cm',
      icon: '👕',
    },
    pullUpBanner: {
      label: 'Pull-up Banner',
      desc: 'Retractable banner stand, ideal for on-site displays and sign-in desks',
      dims: '80 × 200 cm (standard stand)',
      icon: '🪧',
    },
    pvcBanner: {
      label: 'PVC Banner',
      desc: 'Outdoor banner, ideal for entrance displays and fence signage',
      dims: 'A3 / A4 available',
      icon: '📋',
    },
  },

  step2: {
    hint: 'Choose the canvas size. This determines the background template and layout ratio.',
    a3: { label: 'A3', mm: '297 × 420 mm', desc: 'Large format — ideal for stands, stages, and halls' },
    a4: { label: 'A4', mm: '210 × 297 mm', desc: 'Standard — ideal for table displays and frames' },
  },

  step3: {
    hint: 'Choose the occasion theme. The system will filter matching background templates.',
    funeral: {
      label: 'Funeral / Memorial',
      sublabel: 'Funeral & Memorial',
      desc: 'Dignified grey-white palette, suited for funerals and memorial services',
    },
    birthday: {
      label: 'Birthday / Celebration',
      sublabel: 'Birthday & Celebration',
      desc: 'Warm and vibrant palette, suited for birthday parties and anniversaries',
    },
    others: {
      label: 'Other Occasions',
      sublabel: 'Others',
      desc: 'General style, suited for graduations, corporate events, and community gatherings',
    },
  },

  step4: {
    loading: 'Loading background templates…',
    errorTitle: 'Failed to load background templates',
    backendHint: 'Please ensure the backend is running:',
    noTemplates: 'No background templates for this occasion',
    noTemplatesHint: 'Run Generate-SeedImages.ps1 to create placeholder images',
    noPreview: 'Preview not generated',
    filterLabel: 'Filtered occasion: ',
    all: 'All backgrounds',
    count: '{{count}} template(s)',
    sizes: '{{count}} size(s)',
    customUpload: 'Upload Custom Background',
    customUploadDrop: 'Drop image here, or click to upload',
    customUploadHint: 'Supports JPG · PNG · WEBP, max 50 MB',
    customSelected: 'Custom background selected ✓',
    customReplace: 'Replace background',
  },

  step5: {
    hint: 'Upload the subject photo (person or group). The system will remove the background and composite it onto the design.',
    uploadSuccess: 'Upload successful',
    reupload: 'Upload again',
    dropHint: 'Drop an image here, or click to select',
    formatHint: 'Supports JPG · PNG · WEBP, max 20 MB',
    uploading: 'Uploading…',
    invalidFileType: 'Please select an image file (JPG / PNG / WEBP)',
    pocNote: 'PoC: Background removal & colour adjustment pending AI integration',
    adjustments: 'Colour & Style Adjustments',
    adjustmentNote: '* Adjustment controls not yet implemented in PoC',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
  },

  step6: {
    hint: 'Configure the text displayed in the design. Text will be mapped to the template Text Zones.',
    titleField: { label: 'Main Title', hint: 'e.g. In Loving Memory of John Smith' },
    subtitleField: { label: 'Subtitle', hint: 'e.g. 1945 — 2025 · Forever in our hearts' },
    footerField: {
      label: 'Footer',
      hint: 'e.g. Service: 15 March 2025, 10:00 AM · Venue: City Memorial Hall',
    },
    previewLabel: 'Text Preview',
    titlePlaceholder: 'Main title…',
  },

  step7: {
    hint: 'Review your design configuration and export the final file.',
    pocPreview: 'PoC Preview',
    previewNote: '* Server-rendered composite preview — export quality is higher',
    previewLoading: 'Compositing preview on server…',
    previewAlt: 'Design preview',
    previewError: 'Preview generation failed',
    previewErrorHint: 'Please check that the backend service is running',
    previewNoLayout: 'Please select a background template to generate a preview',
    svgExportDone: 'SVG export complete — file downloaded',
    configTitle: 'Design Configuration',
    configProductType: 'Product',
    configSize: 'Size',
    configOccasion: 'Occasion',
    configBackground: 'Background',
    configSubject: 'Subject Photo',
    configMainTitle: 'Main Title',
    subjectUploaded: 'Uploaded ✓',
    subjectNone: 'Not uploaded',
    exportTitle: 'Export',
    exportPocNote: 'PSD / PDF export not yet implemented',
    psd: { label: 'PSD', sub: 'Layered source file' },
    pdf: { label: 'PDF', sub: 'Print-ready' },
    png: { label: 'PNG', sub: 'High resolution' },
    svg: { label: 'SVG', sub: 'Layered vector' },
    psdToast: 'PSD export not yet implemented',
    pdfToast: 'PDF export not yet implemented',
    pngToast: 'PNG export not yet implemented',
    svgExporting: 'Exporting SVG…',
    svgTextCurved: 'Text converted to paths (curves)',
    svgTextFallback: 'Text as text elements (add font file to enable curves)',
    svgFontHint: 'For text curves, place NotoSansSC-Regular.ttf in public/fonts/',
    generateBtn: 'Generate Design',
    generateToast: 'AI compositing pending integration — PoC shows flow only',
    products: {
      TShirt: 'T-Shirt',
      PullUpBanner: 'Pull-up Banner',
      PvcBanner: 'PVC Banner',
    },
    occasions: {
      Funeral: 'Funeral / Memorial',
      Birthday: 'Birthday / Celebration',
      Others: 'Other Occasions',
    },
  },
} as const

export default en
