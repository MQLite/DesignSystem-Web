import { useTranslation } from 'react-i18next'
import type { WizardState, SizeCode } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

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
  const { t } = useTranslation()

  const sizes: { code: SizeCode; label: string; mm: string; desc: string }[] = [
    { code: 'A3', label: t('step2.a3.label'), mm: t('step2.a3.mm'), desc: t('step2.a3.desc') },
    { code: 'A4', label: t('step2.a4.label'), mm: t('step2.a4.mm'), desc: t('step2.a4.desc') },
  ]

  return (
    <div className="max-w-xl">
      <p className="text-gray-500 text-sm mb-6">{t('step2.hint')}</p>
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
                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">{t('common.selected')}</span>
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
