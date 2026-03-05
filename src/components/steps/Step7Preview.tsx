import { useState } from 'react'
import type { WizardState } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const PRODUCT_LABELS: Record<string, string> = {
  TShirt: 'T恤',
  PullUpBanner: 'Pull-up Banner',
  PvcBanner: 'PVC Banner',
}

const OCCASION_LABELS: Record<string, string> = {
  Funeral: '殡仪 / 追思',
  Birthday: '生日 / 庆典',
  Others: '其他场合',
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

export default function Step7Preview({ state }: Props) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const { productType, sizeCode, occasionType, selectedBackground, textConfig, subjectPreviewUrl } =
    state

  return (
    <div className="max-w-3xl">
      <p className="text-gray-500 text-sm mb-6">
        确认以下设计配置，然后导出成品文件。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Canvas preview */}
        <div className="lg:col-span-3">
          <div
            className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex flex-col ${
              sizeCode === 'A3' ? 'aspect-[3/4]' : 'aspect-[3/4]'
            }`}
          >
            {/* Background layer */}
            {selectedBackground?.previewPath ? (
              <img
                src={`/${selectedBackground.previewPath}`}
                alt="背景"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300" />
            )}

            {/* Subject layer (placeholder position) */}
            {subjectPreviewUrl && (
              <div className="absolute inset-0 flex items-center justify-center px-8" style={{ top: '15%', bottom: '25%' }}>
                <img
                  src={subjectPreviewUrl}
                  alt="主体"
                  className="max-w-full max-h-full object-contain opacity-90 drop-shadow-lg"
                />
              </div>
            )}

            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-6">
              {textConfig.title && (
                <p className="text-white font-bold text-lg leading-tight text-center drop-shadow">
                  {textConfig.title}
                </p>
              )}
              {textConfig.subtitle && (
                <p className="text-white/80 text-sm text-center mt-1">{textConfig.subtitle}</p>
              )}
              {textConfig.footer && (
                <p className="text-white/60 text-xs text-center mt-2 border-t border-white/20 pt-2">
                  {textConfig.footer}
                </p>
              )}
            </div>

            {/* PoC watermark */}
            <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
              PoC 预览
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            * 实际输出质量以导出文件为准，此处为示意预览
          </p>
        </div>

        {/* Right: Summary + Export */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">设计配置</h3>
            <SummaryRow label="产品类型" value={PRODUCT_LABELS[productType ?? ''] ?? '—'} />
            <SummaryRow label="尺寸" value={sizeCode ?? '—'} />
            <SummaryRow label="场合" value={OCCASION_LABELS[occasionType ?? ''] ?? '—'} />
            <SummaryRow label="背景模板" value={selectedBackground?.name ?? '—'} />
            <SummaryRow label="主体照片" value={subjectPreviewUrl ? '已上传 ✓' : '未上传'} />
            <SummaryRow label="主标题" value={textConfig.title || '—'} />
          </div>

          {/* Export */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">导出文件</h3>
            <p className="text-xs text-gray-400 mb-4">PoC 阶段：导出功能待实现</p>
            <div className="flex gap-3">
              <ExportButton
                icon="🎨"
                label="PSD"
                sub="分层源文件"
                onClick={() => showToast('PSD 导出功能待实现')}
              />
              <ExportButton
                icon="📄"
                label="PDF"
                sub="印刷就绪"
                onClick={() => showToast('PDF 导出功能待实现')}
              />
              <ExportButton
                icon="🖼️"
                label="PNG"
                sub="高分辨率"
                onClick={() => showToast('PNG 导出功能待实现')}
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={() => showToast('AI 合成功能待接入，PoC 仅展示流程')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            生成设计稿
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 transition-opacity">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
