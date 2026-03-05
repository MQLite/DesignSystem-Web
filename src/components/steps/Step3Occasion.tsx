import type { WizardState, OccasionType } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const occasions: {
  type: OccasionType
  label: string
  sublabel: string
  desc: string
  palette: string[]
  bg: string
  border: string
}[] = [
  {
    type: 'Funeral',
    label: '殡仪 / 追思',
    sublabel: 'Funeral & Memorial',
    desc: '庄重典雅的灰白色系，适合白事、追思会、葬礼场合',
    palette: ['#1a1a1a', '#4a4a4a', '#8a8a8a', '#d4d4d4', '#f5f5f5'],
    bg: 'bg-gray-50',
    border: 'border-gray-400',
  },
  {
    type: 'Birthday',
    label: '生日 / 庆典',
    sublabel: 'Birthday & Celebration',
    desc: '温暖活泼的彩色系，适合生日宴会、周年纪念、开幕庆典',
    palette: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#22c55e'],
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
  },
  {
    type: 'Others',
    label: '其他场合',
    sublabel: 'Others',
    desc: '通用风格，适合毕业典礼、企业活动、社区聚会等',
    palette: ['#3b82f6', '#6366f1', '#0ea5e9', '#14b8a6', '#64748b'],
    bg: 'bg-blue-50',
    border: 'border-blue-400',
  },
]

export default function Step3Occasion({ state, update }: Props) {
  return (
    <div className="max-w-2xl">
      <p className="text-gray-500 text-sm mb-6">选择场合主题，系统将筛选对应风格的背景模板。</p>
      <div className="grid grid-cols-1 gap-4">
        {occasions.map((o) => {
          const selected = state.occasionType === o.type
          return (
            <button
              key={o.type}
              onClick={() =>
                update({ occasionType: o.type, selectedBackground: null, selectedLayoutId: null })
              }
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? `${o.bg} ${o.border} shadow-sm`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{o.label}</h3>
                    <span className="text-xs text-gray-400">{o.sublabel}</span>
                    {selected && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-auto">
                        已选
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5">{o.desc}</p>
                  <div className="flex gap-1.5 mt-3">
                    {o.palette.map((c) => (
                      <span
                        key={c}
                        className="w-5 h-5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
