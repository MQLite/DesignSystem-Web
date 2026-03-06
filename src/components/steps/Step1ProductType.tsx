import { useTranslation } from 'react-i18next'
import type { WizardState, ProductType } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

export default function Step1ProductType({ state, update }: Props) {
  const { t } = useTranslation()

  const products: { type: ProductType; label: string; desc: string; dims: string; icon: string }[] = [
    {
      type: 'TShirt',
      label: t('step1.tshirt.label'),
      desc: t('step1.tshirt.desc'),
      dims: t('step1.tshirt.dims'),
      icon: t('step1.tshirt.icon'),
    },
    {
      type: 'PullUpBanner',
      label: t('step1.pullUpBanner.label'),
      desc: t('step1.pullUpBanner.desc'),
      dims: t('step1.pullUpBanner.dims'),
      icon: t('step1.pullUpBanner.icon'),
    },
    {
      type: 'PvcBanner',
      label: t('step1.pvcBanner.label'),
      desc: t('step1.pvcBanner.desc'),
      dims: t('step1.pvcBanner.dims'),
      icon: t('step1.pvcBanner.icon'),
    },
  ]

  return (
    <div className="max-w-2xl">
      <p className="text-gray-500 text-sm mb-6">{t('step1.hint')}</p>
      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => {
          const selected = state.productType === p.type
          return (
            <button
              key={p.type}
              onClick={() => update({ productType: p.type })}
              className={`flex items-center gap-5 p-5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-4xl flex-shrink-0 w-14 text-center">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{p.label}</h3>
                  {selected && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">{t('common.selected')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{p.dims}</p>
              </div>
              <span
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                  selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                }`}
              >
                {selected && (
                  <svg viewBox="0 0 20 20" fill="white" className="w-full h-full">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
