const zhCN = {
  app: {
    title: 'Design Studio',
    subtitle: '纪念品设计系统',
    poc: 'PoC v0.1',
    autosave: '草稿自动保存',
    flow: '设计流程',
  },

  nav: {
    back: '← 上一步',
    next: '下一步 →',
    lastStep: '已到最后一步',
    stepOf: '步骤 {{current}} / {{total}}',
  },

  steps: {
    productType: '产品类型',
    size: '尺寸选择',
    occasion: '场合主题',
    background: '背景模板',
    subject: '主体照片',
    textConfig: '文字配置',
    preview: '预览导出',
  },

  common: {
    selected: '已选',
    inputPlaceholder: '输入内容…',
  },

  step1: {
    hint: '选择您需要制作的纪念品类型，后续步骤将根据此选择调整。',
    tshirt: {
      label: 'T恤',
      desc: '纪念T恤设计，适合聚会、纪念活动',
      dims: '正面约 30 × 40 cm',
      icon: '👕',
    },
    pullUpBanner: {
      label: 'Pull-up Banner',
      desc: '展架海报，适合现场展示、签到台',
      dims: '80 × 200 cm（标准展架）',
      icon: '🪧',
    },
    pvcBanner: {
      label: 'PVC Banner',
      desc: '户外横幅，适合门口挂幅、围栏展示',
      dims: 'A3 / A4 可选',
      icon: '📋',
    },
  },

  step2: {
    hint: '选择设计尺寸，将决定背景模板和布局比例。',
    a3: { label: 'A3', mm: '297 × 420 mm', desc: '大尺寸，适合展架、展台、礼堂布置' },
    a4: { label: 'A4', mm: '210 × 297 mm', desc: '标准尺寸，适合桌摆、相框、小型展示' },
  },

  step3: {
    hint: '选择场合主题，系统将筛选对应风格的背景模板。',
    funeral: {
      label: '殡仪 / 追思',
      sublabel: 'Funeral & Memorial',
      desc: '庄重典雅的灰白色系，适合白事、追思会、葬礼场合',
    },
    birthday: {
      label: '生日 / 庆典',
      sublabel: 'Birthday & Celebration',
      desc: '温暖活泼的彩色系，适合生日宴会、周年纪念、开幕庆典',
    },
    others: {
      label: '其他场合',
      sublabel: 'Others',
      desc: '通用风格，适合毕业典礼、企业活动、社区聚会等',
    },
  },

  step4: {
    loading: '加载背景模板中…',
    errorTitle: '无法加载背景模板',
    backendHint: '请确认后端已启动：',
    noTemplates: '该场合暂无背景模板',
    noTemplatesHint: '可先运行 Generate-SeedImages.ps1 生成占位图',
    noPreview: '预览图未生成',
    filterLabel: '筛选场合：',
    all: '全部背景',
    count: '共 {{count}} 个模板',
    sizes: '{{count}} 尺寸',
    customUpload: '上传自定义背景',
    customUploadDrop: '拖放图片至此，或点击上传',
    customUploadHint: '支持 JPG · PNG · WEBP，最大 50 MB',
    customSelected: '自定义背景已选 ✓',
    customReplace: '更换背景',
  },

  step5: {
    hint: '上传主体照片（人物 / 团体照）。系统将自动抠图并融合至背景模板中。',
    uploadSuccess: '上传成功',
    reupload: '重新上传',
    dropHint: '拖放图片至此，或点击选择',
    formatHint: '支持 JPG · PNG · WEBP，最大 20 MB',
    uploading: '上传中…',
    invalidFileType: '请选择图片文件（JPG / PNG / WEBP）',
    pocNote: 'PoC 阶段：抠图 & 颜色调整功能待接入 AI 服务',
    adjustments: '颜色 & 风格调整',
    adjustmentNote: '* 调整功能在 PoC 阶段暂未实现',
    brightness: '亮度',
    contrast: '对比度',
    saturation: '饱和度',
  },

  step6: {
    hint: '配置设计中显示的文字内容。文字将对应到背景模板的 Text Zone 区域。',
    titleField: { label: '主标题', hint: '例：陈大明先生追思会' },
    subtitleField: { label: '副标题', hint: '例：1945 — 2025 · 永远怀念' },
    footerField: {
      label: '页脚文字',
      hint: '例：活动时间：2025 年 3 月 15 日 上午 10 时 · 地点：XX 殡仪馆',
    },
    previewLabel: '文字预览',
    titlePlaceholder: '主标题…',
  },

  step7: {
    hint: '确认以下设计配置，然后导出成品文件。',
    pocPreview: 'PoC 预览',
    previewNote: '* 实际输出质量以导出文件为准，此处为示意预览',
    configTitle: '设计配置',
    configProductType: '产品类型',
    configSize: '尺寸',
    configOccasion: '场合',
    configBackground: '背景模板',
    configSubject: '主体照片',
    configMainTitle: '主标题',
    subjectUploaded: '已上传 ✓',
    subjectNone: '未上传',
    exportTitle: '导出文件',
    exportPocNote: 'PSD / PDF 导出功能待实现',
    psd: { label: 'PSD', sub: '分层源文件' },
    pdf: { label: 'PDF', sub: '印刷就绪' },
    png: { label: 'PNG', sub: '高分辨率' },
    svg: { label: 'SVG', sub: '分层矢量' },
    psdToast: 'PSD 导出功能待实现',
    pdfToast: 'PDF 导出功能待实现',
    pngToast: 'PNG 导出功能待实现',
    svgExporting: 'SVG 导出中…',
    svgTextCurved: '文字已曲线化（路径模式）',
    svgTextFallback: '文字为文本元素（添加字体文件以曲线化）',
    svgFontHint: '如需文字曲线化，请将 NotoSansSC-Regular.ttf 放至 public/fonts/ 目录',
    generateBtn: '生成设计稿',
    generateToast: 'AI 合成功能待接入，PoC 仅展示流程',
    products: {
      TShirt: 'T恤',
      PullUpBanner: 'Pull-up Banner',
      PvcBanner: 'PVC Banner',
    },
    occasions: {
      Funeral: '殡仪 / 追思',
      Birthday: '生日 / 庆典',
      Others: '其他场合',
    },
  },
} as const

export default zhCN
export type TranslationKeys = typeof zhCN
