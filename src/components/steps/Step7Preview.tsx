import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardState, ComposePreviewRequest } from '../../types'
import { composePreview, composeExportSvg } from '../../api/client'

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
  disabled,
  onClick,
}: {
  label: string
  icon: string
  sub: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm text-gray-900">{label}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </button>
  )
}

export default function Step7Preview({ state }: Props) {
  const { t } = useTranslation()
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [svgExporting, setSvgExporting] = useState(false)

  const { productType, sizeCode, occasionType, selectedBackground, selectedLayoutId,
    subjectAssetId, textConfig, subjectPreviewUrl, canvasLayout } = state

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Build the compose request — only possible when a template layout is selected
  const composeReq: ComposePreviewRequest | null = selectedLayoutId
    ? {
        backgroundLayoutId: selectedLayoutId,
        subjectAssetId: subjectAssetId ?? undefined,
        textConfigJson: JSON.stringify(textConfig),
        canvasLayoutJson: JSON.stringify(canvasLayout),
      }
    : null

  // Fetch backend preview on mount
  useEffect(() => {
    if (!composeReq) return
    setPreviewStatus('loading')
    composePreview(composeReq)
      .then((res) => {
        setPreviewUrl(`/${res.previewRelativePath}`)
        setPreviewStatus('done')
      })
      .catch((e: Error) => {
        setPreviewStatus('error')
        showToast(e.message)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount — component remounts each time user enters Step 7

  const handleSvgExport = async () => {
    if (!composeReq) return
    setSvgExporting(true)
    try {
      const res = await composeExportSvg(composeReq)
      // Trigger browser download via the served static file
      const a = document.createElement('a')
      a.href = `/${res.exportRelativePath}`
      a.download = `design-${sizeCode ?? 'export'}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      showToast(t('step7.svgExportDone'))
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
        {/* Left: Backend-rendered preview */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/4] flex items-center justify-center">
            {previewStatus === 'loading' && (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">{t('step7.previewLoading')}</span>
              </div>
            )}

            {previewStatus === 'done' && previewUrl && (
              <img
                src={previewUrl}
                alt={t('step7.previewAlt')}
                className="w-full h-full object-contain"
              />
            )}

            {previewStatus === 'error' && (
              <div className="text-center p-6 text-gray-400">
                <p className="text-sm font-medium text-red-500 mb-1">{t('step7.previewError')}</p>
                <p className="text-xs">{t('step7.previewErrorHint')}</p>
              </div>
            )}

            {previewStatus === 'idle' && !composeReq && (
              <div className="text-center p-6 text-gray-400">
                <p className="text-sm">{t('step7.previewNoLayout')}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{t('step7.previewNote')}</p>
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
                disabled={!composeReq || svgExporting}
                onClick={handleSvgExport}
              />
            </div>
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
