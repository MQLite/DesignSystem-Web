import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Step3Occasion from '../components/steps/Step3Occasion'
import type { WizardState } from '../types'

const BASE: WizardState = {
  step: 3, productType: 'PvcBanner', sizeCode: 'A3', occasionType: null,
  selectedBackground: null, selectedLayoutId: null,
  subjectAssetId: null, subjectPreviewUrl: null,
  textConfig: { title: '', subtitle: '', footer: '' },
}

describe('Step3Occasion', () => {
  it('renders all three occasions', () => {
    render(<Step3Occasion state={BASE} update={() => {}} />)
    expect(screen.getByText('殡仪 / 追思')).toBeInTheDocument()
    expect(screen.getByText('生日 / 庆典')).toBeInTheDocument()
    expect(screen.getByText('其他场合')).toBeInTheDocument()
  })

  it('clicking Funeral calls update with occasionType=Funeral', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText('殡仪 / 追思'))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ occasionType: 'Funeral' }),
    )
  })

  it('clicking Birthday calls update with occasionType=Birthday', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText('生日 / 庆典'))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ occasionType: 'Birthday' }),
    )
  })

  it('selecting occasion resets selectedBackground', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText('其他场合'))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ selectedBackground: null, selectedLayoutId: null }),
    )
  })

  it('shows colour palette swatches for each occasion', () => {
    render(<Step3Occasion state={BASE} update={() => {}} />)
    // Each occasion renders 5 colour swatches
    const swatches = document.querySelectorAll('span.rounded-full.border.border-white')
    expect(swatches.length).toBe(15)
  })
})
