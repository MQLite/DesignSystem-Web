import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardState } from '../../types'
import { exportSvg } from '../../utils/svgExport'
import DesignCanvas from '../DesignCanvas'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function ExportButton({
  label,
  icon,
  sub,
  onClick,
}: {
  label: string
  icon: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm text-gray-900">{label}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </button>
  )
}

export default function Step7Preview({ state, update }: Props) {
  const { t } = useTranslation()
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [svgExporting, setSvgExporting] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  const { productType, sizeCode, occasionType, selectedBackground, textConfig, subjectPreviewUrl,
    customBackgroundUrl, canvasLayout } = state

  const effectiveBgUrl = customBackgroundUrl
    ?? (selectedBackground?.previewPath ? `/${selectedBackground.previewPath}` : null)

  const handleSvgExport = async () => {
    setSvgExporting(true)
    try {
      const result = await exportSvg({
        backgroundUrl: effectiveBgUrl,
        subjectUrl: subjectPreviewUrl,
        title: textConfig.title,
        subtitle: textConfig.subtitle,
        footer: textConfig.footer,
        sizeCode,
        canvasLayout,
        fontUrl: '/fonts/NotoSansSC-Regular.ttf',
      })
      showToast(result.textCurved ? t('step7.svgTextCurved') : t('step7.svgTextFallback'))
    } catch (e) {
      showToast((e as Error).message)
    } finally {
      setSvgExporting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <p className="text-gray-500 text-sm mb-6">{t('step7.hint')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Canvas preview */}
        <div className="lg:col-span-3">
          <DesignCanvas
            backgroundUrl={effectiveBgUrl}
            subjectUrl={subjectPreviewUrl}
            textConfig={textConfig}
            layout={canvasLayout}
            onLayoutChange={(l) => update({ canvasLayout: l })}
            watermark={t('step7.pocPreview')}
          />
        </div>

        {/* Right: Summary + Export */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('step7.configTitle')}</h3>
            <SummaryRow label={t('step7.configProductType')} value={productType ? t(`step7.products.${productType}`) : '—'} />
            <SummaryRow label={t('step7.configSize')} value={sizeCode ?? '—'} />
            <SummaryRow label={t('step7.configOccasion')} value={occasionType ? t(`step7.occasions.${occasionType}`) : '—'} />
            <SummaryRow label={t('step7.configBackground')} value={selectedBackground?.name ?? '—'} />
            <SummaryRow label={t('step7.configSubject')} value={subjectPreviewUrl ? t('step7.subjectUploaded') : t('step7.subjectNone')} />
            <SummaryRow label={t('step7.configMainTitle')} value={textConfig.title || '—'} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{t('step7.exportTitle')}</h3>
            <p className="text-xs text-gray-400 mb-4">{t('step7.exportPocNote')}</p>
            <div className="flex gap-3">
              <ExportButton icon="🎨" label={t('step7.psd.label')} sub={t('step7.psd.sub')} onClick={() => showToast(t('step7.psdToast'))} />
              <ExportButton icon="📄" label={t('step7.pdf.label')} sub={t('step7.pdf.sub')} onClick={() => showToast(t('step7.pdfToast'))} />
              <ExportButton icon="🖼️" label={t('step7.png.label')} sub={t('step7.png.sub')} onClick={() => showToast(t('step7.pngToast'))} />
              <ExportButton
                icon={svgExporting ? '⏳' : '📐'}
                label={t('step7.svg.label')}
                sub={svgExporting ? t('step7.svgExporting') : t('step7.svg.sub')}
                onClick={svgExporting ? () => {} : handleSvgExport}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">{t('step7.svgFontHint')}</p>
          </div>

          <button
            onClick={() => showToast(t('step7.generateToast'))}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {t('step7.generateBtn')}
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 transition-opacity">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
