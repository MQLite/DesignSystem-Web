import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardState } from './types'
import WizardLayout from './components/WizardLayout'
import Step1ProductType from './components/steps/Step1ProductType'
import Step2Size from './components/steps/Step2Size'
import Step3Occasion from './components/steps/Step3Occasion'
import Step4Background from './components/steps/Step4Background'
import Step5Subject from './components/steps/Step5Subject'
import Step6TextConfig from './components/steps/Step6TextConfig'
import Step7Preview from './components/steps/Step7Preview'

const INITIAL: WizardState = {
  step: 1,
  productType: null,
  sizeCode: null,
  occasionType: null,
  selectedBackground: null,
  selectedLayoutId: null,
  subjectAssetId: null,
  subjectPreviewUrl: null,
  textConfig: { title: '', subtitle: '', footer: '' },
}

export default function App() {
  const { t } = useTranslation()
  const [state, setState] = useState<WizardState>(INITIAL)

  const stepLabels = [
    t('steps.productType'),
    t('steps.size'),
    t('steps.occasion'),
    t('steps.background'),
    t('steps.subject'),
    t('steps.textConfig'),
    t('steps.preview'),
  ]

  const update = (patch: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...patch }))

  const next = () => setState((s) => ({ ...s, step: Math.min(s.step + 1, 7) }))
  const back = () => setState((s) => ({ ...s, step: Math.max(s.step - 1, 1) }))

  const canNext = (): boolean => {
    switch (state.step) {
      case 1: return state.productType !== null
      case 2: return state.sizeCode !== null
      case 3: return state.occasionType !== null
      case 4: return state.selectedBackground !== null
      case 5: return state.subjectAssetId !== null
      case 6: return state.textConfig.title.trim().length > 0
      default: return false
    }
  }

  const stepContent = [
    <Step1ProductType key={1} state={state} update={update} />,
    <Step2Size key={2} state={state} update={update} />,
    <Step3Occasion key={3} state={state} update={update} />,
    <Step4Background key={4} state={state} update={update} />,
    <Step5Subject key={5} state={state} update={update} />,
    <Step6TextConfig key={6} state={state} update={update} />,
    <Step7Preview key={7} state={state} update={update} />,
  ]

  return (
    <WizardLayout
      step={state.step}
      steps={stepLabels}
      onNext={next}
      onBack={back}
      canNext={canNext()}
    >
      {stepContent[state.step - 1]}
    </WizardLayout>
  )
}
