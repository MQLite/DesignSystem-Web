import { useEffect, useState } from 'react'
import type { WizardState, BackgroundDto } from '../../types'
import { getBackgrounds } from '../../api/client'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

function BackgroundCard({
  bg,
  selected,
  sizeCode,
  onClick,
}: {
  bg: BackgroundDto
  selected: boolean
  sizeCode: string | null
  onClick: () => void
}) {
  const layout = bg.layout.find((l) => l.sizeCode === sizeCode) ?? bg.layout[0]
  const [imgErr, setImgErr] = useState(false)

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 overflow-hidden text-left transition-all ${
        selected ? 'border-indigo-600 shadow-md' : 'border-gray-200 hover:border-indigo-300'
      }`}
    >
      {/* Preview image */}
      <div className="relative bg-gray-100 aspect-[3/4] w-full overflow-hidden">
        {bg.previewPath && !imgErr ? (
          <img
            src={`/${bg.previewPath}`}
            alt={bg.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">预览图未生成</span>
          </div>
        )}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <p className="font-medium text-gray-900 text-sm truncate">{bg.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">
            {layout ? `${layout.sizeCode} · ${layout.orientation}` : '—'}
          </span>
          {bg.layout.length > 1 && (
            <span className="text-xs text-indigo-500">{bg.layout.length} 尺寸</span>
          )}
        </div>
      </div>
    </button>
  )
}

export default function Step4Background({ state, update }: Props) {
  const [backgrounds, setBackgrounds] = useState<BackgroundDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getBackgrounds()
      .then(setBackgrounds)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = state.occasionType
    ? backgrounds.filter((b) => b.occasionType === state.occasionType)
    : backgrounds

  const handleSelect = (bg: BackgroundDto) => {
    const layout = bg.layout.find((l) => l.sizeCode === state.sizeCode) ?? bg.layout[0]
    update({ selectedBackground: bg, selectedLayoutId: layout?.id ?? null })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 gap-3">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        加载背景模板中…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">无法加载背景模板</p>
        <p className="text-red-400 text-sm mt-1">{error}</p>
        <p className="text-gray-400 text-xs mt-3">
          请确认后端已启动：<code className="bg-red-100 px-1 rounded">dotnet run</code>
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-500 text-sm">
          {state.occasionType ? `筛选场合：${state.occasionType}` : '全部背景'} · 共 {filtered.length} 个模板
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <p>该场合暂无背景模板</p>
          <p className="text-sm mt-1">可先运行 Generate-SeedImages.ps1 生成占位图</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((bg) => (
            <BackgroundCard
              key={bg.id}
              bg={bg}
              selected={state.selectedBackground?.id === bg.id}
              sizeCode={state.sizeCode}
              onClick={() => handleSelect(bg)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
