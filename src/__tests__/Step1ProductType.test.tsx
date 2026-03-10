import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import i18n from '../i18n'
import Step1ProductType from '../components/steps/Step1ProductType'
import type { WizardState } from '../types'

const { t } = i18n

const BASE: WizardState = {
  step: 1, productType: null, sizeCode: null, occasionType: null,
  selectedBackground: null, selectedLayoutId: null, customBackgroundUrl: null,
  subjectAssetId: null, subjectPreviewUrl: null,
  textConfig: { title: '', subtitle: '', footer: '' },
}

// Stateful wrapper so selection state actually updates the UI
function Wrapper(init: Partial<WizardState> = {}) {
  function Inner() {
    const [state, setState] = useState<WizardState>({ ...BASE, ...init })
    return <Step1ProductType state={state} update={(p) => setState((s) => ({ ...s, ...p }))} />
  }
  render(<Inner />)
}

describe('Step1ProductType', () => {
  it('renders all three product cards', () => {
    Wrapper()
    expect(screen.getByText(t('step1.tshirt.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step1.pullUpBanner.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step1.pvcBanner.label'))).toBeInTheDocument()
  })

  it('no selected badge before selection', () => {
    Wrapper()
    expect(screen.queryByText(t('common.selected'))).not.toBeInTheDocument()
  })

  it('clicking TShirt shows selected badge', async () => {
    Wrapper()
    await userEvent.click(screen.getByText(t('step1.tshirt.label')))
    expect(screen.getByText(t('common.selected'))).toBeInTheDocument()
  })

  it('clicking Pull-up Banner calls update with correct type', async () => {
    const update = vi.fn()
    render(<Step1ProductType state={BASE} update={update} />)
    await userEvent.click(screen.getByText(t('step1.pullUpBanner.label')))
    expect(update).toHaveBeenCalledWith({ productType: 'PullUpBanner' })
  })

  it('clicking PVC Banner calls update with PvcBanner', async () => {
    const update = vi.fn()
    render(<Step1ProductType state={BASE} update={update} />)
    await userEvent.click(screen.getByText(t('step1.pvcBanner.label')))
    expect(update).toHaveBeenCalledWith({ productType: 'PvcBanner' })
  })

  it('pre-selected product already shows selected badge', () => {
    Wrapper({ productType: 'PullUpBanner' })
    expect(screen.getByText(t('common.selected'))).toBeInTheDocument()
  })

  it('switching product moves selected badge', async () => {
    Wrapper({ productType: 'TShirt' })
    expect(screen.getByText(t('common.selected'))).toBeInTheDocument()
    await userEvent.click(screen.getByText(t('step1.pvcBanner.label')))
    expect(screen.getAllByText(t('common.selected'))).toHaveLength(1)
  })
})
