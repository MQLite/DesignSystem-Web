import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import Step1ProductType from '../components/steps/Step1ProductType'
import type { WizardState } from '../types'

const BASE: WizardState = {
  step: 1, productType: null, sizeCode: null, occasionType: null,
  selectedBackground: null, selectedLayoutId: null,
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
    expect(screen.getByText('T恤')).toBeInTheDocument()
    expect(screen.getByText('Pull-up Banner')).toBeInTheDocument()
    expect(screen.getByText('PVC Banner')).toBeInTheDocument()
  })

  it('no 已选 badge before selection', () => {
    Wrapper()
    expect(screen.queryByText('已选')).not.toBeInTheDocument()
  })

  it('clicking T恤 shows 已选 badge', async () => {
    Wrapper()
    await userEvent.click(screen.getByText('T恤'))
    expect(screen.getByText('已选')).toBeInTheDocument()
  })

  it('clicking Pull-up Banner calls update with correct type', async () => {
    const update = vi.fn()
    render(<Step1ProductType state={BASE} update={update} />)
    await userEvent.click(screen.getByText('Pull-up Banner'))
    expect(update).toHaveBeenCalledWith({ productType: 'PullUpBanner' })
  })

  it('clicking PVC Banner calls update with PvcBanner', async () => {
    const update = vi.fn()
    render(<Step1ProductType state={BASE} update={update} />)
    await userEvent.click(screen.getByText('PVC Banner'))
    expect(update).toHaveBeenCalledWith({ productType: 'PvcBanner' })
  })

  it('pre-selected product already shows 已选 badge', () => {
    Wrapper({ productType: 'PullUpBanner' })
    expect(screen.getByText('已选')).toBeInTheDocument()
  })

  it('switching product moves 已选 badge', async () => {
    Wrapper({ productType: 'TShirt' })
    expect(screen.getByText('已选')).toBeInTheDocument()
    await userEvent.click(screen.getByText('PVC Banner'))
    // Still only one badge after switch
    expect(screen.getAllByText('已选')).toHaveLength(1)
  })
})
