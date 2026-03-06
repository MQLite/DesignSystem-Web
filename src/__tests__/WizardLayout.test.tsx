import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import i18n from '../i18n'
import WizardLayout from '../components/WizardLayout'

const { t } = i18n

// Use translated step labels matching App.tsx
const STEPS = [
  t('steps.productType'),
  t('steps.size'),
  t('steps.occasion'),
  t('steps.background'),
]

function setup({
  step = 1,
  canNext = true,
  onNext = vi.fn(),
  onBack = vi.fn(),
} = {}) {
  render(
    <WizardLayout step={step} steps={STEPS} onNext={onNext} onBack={onBack} canNext={canNext}>
      <div>content</div>
    </WizardLayout>,
  )
  return { onNext, onBack }
}

describe('WizardLayout', () => {
  it('renders the active step label in the header', () => {
    setup({ step: 2 })
    expect(screen.getAllByText(t('steps.size')).length).toBeGreaterThan(0)
  })

  it('shows step progress as "步骤 N / total"', () => {
    setup({ step: 3 })
    expect(screen.getByText(t('nav.stepOf', { current: 3, total: 4 }))).toBeInTheDocument()
  })

  it('Back button is disabled on first step', () => {
    setup({ step: 1 })
    expect(screen.getByText(t('nav.back'))).toBeDisabled()
  })

  it('Back button is enabled after first step', () => {
    setup({ step: 2 })
    expect(screen.getByText(t('nav.back'))).not.toBeDisabled()
  })

  it('Next button is disabled when canNext=false', () => {
    setup({ canNext: false })
    expect(screen.getByText(t('nav.next'))).toBeDisabled()
  })

  it('Next button is enabled when canNext=true', () => {
    setup({ canNext: true })
    expect(screen.getByText(t('nav.next'))).not.toBeDisabled()
  })

  it('clicking Next calls onNext', async () => {
    const { onNext } = setup({ canNext: true })
    await userEvent.click(screen.getByText(t('nav.next')))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('clicking Back calls onBack', async () => {
    const { onBack } = setup({ step: 2 })
    await userEvent.click(screen.getByText(t('nav.back')))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('Next button is absent on last step', () => {
    setup({ step: STEPS.length })
    expect(screen.queryByText(t('nav.next'))).not.toBeInTheDocument()
  })

  it('renders children content', () => {
    setup()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('dot indicators: active dot count equals steps length', () => {
    setup({ step: 2 })
    // Footer dots: one per step
    const footer = document.querySelector('footer')!
    const dots = footer.querySelectorAll('span.rounded-full')
    expect(dots.length).toBe(STEPS.length)
  })
})
