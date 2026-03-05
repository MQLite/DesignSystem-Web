import type { WizardState, SizeCode } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const sizes: { code: SizeCode; label: string; mm: string; desc: string }[] = [
  { code: 'A3', label: 'A3', mm: '297 × 420 mm', desc: '大尺寸，适合展架、展台、礼堂布置' },
  { code: 'A4', label: 'A4', mm: '210 × 297 mm', desc: '标准尺寸，适合桌摆、相框、小型展示' },
]

function SizePreview({ code }: { code: SizeCode }) {
  const isA3 = code === 'A3'
  return (
    <div className="flex items-end justify-center h-20">
      <div
        className={`border-2 border-gray-400 bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium transition-all ${
          isA3 ? 'w-14 h-20' : 'w-12 h-16'
        }`}
      >
        {code}
      </div>
    </div>
  )
}

export default function Step2Size({ state, update }: Props) {
  return (
    <div className="max-w-xl">
      <p className="text-gray-500 text-sm mb-6">选择设计尺寸，将决定背景模板和布局比例。</p>
      <div className="grid grid-cols-2 gap-4">
        {sizes.map((s) => {
          const selected = state.sizeCode === s.code
          return (
            <button
              key={s.code}
              onClick={() => update({ sizeCode: s.code, selectedBackground: null, selectedLayoutId: null })}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <SizePreview code={s.code} />
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{s.label}</h3>
                  {selected && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">已选</span>
                  )}
                </div>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{s.mm}</p>
                <p className="text-sm text-gray-500 mt-2">{s.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
