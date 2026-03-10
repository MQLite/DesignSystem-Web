import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import i18n from '../i18n'
import Step3Occasion from '../components/steps/Step3Occasion'
import type { WizardState } from '../types'

const { t } = i18n

const BASE: WizardState = {
  step: 3, productType: 'PvcBanner', sizeCode: 'A3', occasionType: null,
  selectedBackground: null, selectedLayoutId: null, customBackgroundUrl: null,
  subjectAssetId: null, subjectPreviewUrl: null,
  textConfig: { title: '', subtitle: '', footer: '' },
}

describe('Step3Occasion', () => {
  it('renders all three occasions', () => {
    render(<Step3Occasion state={BASE} update={() => {}} />)
    expect(screen.getByText(t('step3.funeral.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step3.birthday.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step3.others.label'))).toBeInTheDocument()
  })

  it('clicking Funeral calls update with occasionType=Funeral', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText(t('step3.funeral.label')))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ occasionType: 'Funeral' }),
    )
  })

  it('clicking Birthday calls update with occasionType=Birthday', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText(t('step3.birthday.label')))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ occasionType: 'Birthday' }),
    )
  })

  it('selecting occasion resets selectedBackground', async () => {
    const update = vi.fn()
    render(<Step3Occasion state={BASE} update={update} />)
    await userEvent.click(screen.getByText(t('step3.others.label')))
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
