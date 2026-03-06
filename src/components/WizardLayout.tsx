import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import StepIndicator from './StepIndicator'

interface Props {
  step: number
  steps: string[]
  children: ReactNode
  onNext: () => void
  onBack: () => void
  canNext: boolean
}

export default function WizardLayout({ step, steps, children, onNext, onBack, canNext }: Props) {
  const { t } = useTranslation()
  const isLast = step === steps.length

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">D</span>
            <h1 className="text-base font-bold tracking-tight">{t('app.title')}</h1>
          </div>
          <p className="text-slate-400 text-xs pl-10">{t('app.subtitle')}</p>
        </div>

        <nav className="flex-1 p-3 pt-4 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">{t('app.flow')}</p>
          <StepIndicator steps={steps} currentStep={step} />
        </nav>

        <div className="px-5 py-4 border-t border-slate-700/60">
          <p className="text-xs text-slate-500">{t('app.poc')}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              {t('nav.stepOf', { current: step, total: steps.length })}
            </p>
            <h2 className="text-lg font-semibold text-gray-900 mt-0.5">{steps[step - 1]}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            {t('app.autosave')}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>

        {/* Footer nav */}
        <footer className="bg-white border-t border-gray-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <button
            onClick={onBack}
            disabled={step === 1}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('nav.back')}
          </button>

          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i + 1 === step ? 'bg-indigo-600' : i + 1 < step ? 'bg-indigo-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {!isLast ? (
            <button
              onClick={onNext}
              disabled={!canNext}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('nav.next')}
            </button>
          ) : (
            <span className="px-5 py-2 text-sm text-gray-400">{t('nav.lastStep')}</span>
          )}
        </footer>
      </div>
    </div>
  )
}
