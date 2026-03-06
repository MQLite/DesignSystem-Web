import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import i18n from '../i18n'
import StepIndicator from '../components/StepIndicator'

const { t } = i18n

const STEPS = [t('steps.productType'), t('steps.size'), t('steps.occasion')]

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />)
    STEPS.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
  })

  it('shows step numbers for all steps when on step 1', () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText('✓')).not.toBeInTheDocument()
  })

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator steps={STEPS} currentStep={3} />)
    const checks = screen.getAllByText('✓')
    expect(checks).toHaveLength(2) // steps 1 and 2 are done
  })

  it('active step does not show a checkmark', () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />)
    // Only step 1 is done
    expect(screen.getAllByText('✓')).toHaveLength(1)
    // Step 2 is active — shows its number
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('on last step all previous steps show checkmarks', () => {
    const steps = ['A', 'B', 'C', 'D']
    render(<StepIndicator steps={steps} currentStep={4} />)
    expect(screen.getAllByText('✓')).toHaveLength(3)
  })
})
