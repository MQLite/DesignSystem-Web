import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import i18n from '../i18n'
import Step6TextConfig from '../components/steps/Step6TextConfig'
import type { WizardState } from '../types'

const { t } = i18n

const BASE: WizardState = {
  step: 6, productType: 'PvcBanner', sizeCode: 'A3', occasionType: 'Funeral',
  selectedBackground: null, selectedLayoutId: null, customBackgroundUrl: null,
  subjectAssetId: null, subjectPreviewUrl: null,
  textConfig: { title: '', subtitle: '', footer: '' },
}

// Stateful wrapper — required for controlled inputs to actually update
function Wrapper(init: Partial<WizardState> = {}) {
  function Inner() {
    const [state, setState] = useState<WizardState>({ ...BASE, ...init })
    return (
      <Step6TextConfig
        state={state}
        update={(p) => setState((s) => ({ ...s, ...p }))}
      />
    )
  }
  render(<Inner />)
}

describe('Step6TextConfig', () => {
  it('renders three labelled fields', () => {
    Wrapper()
    expect(screen.getByText(t('step6.titleField.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step6.subtitleField.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step6.footerField.label'))).toBeInTheDocument()
  })

  it('title field is marked required', () => {
    Wrapper()
    // Required fields render an asterisk next to the label
    const asterisks = document.querySelectorAll('span.text-red-500')
    expect(asterisks.length).toBeGreaterThanOrEqual(1)
  })

  it('live preview shows placeholder when title is empty', () => {
    Wrapper()
    expect(screen.getByText(t('step6.titlePlaceholder'))).toBeInTheDocument()
  })

  it('live preview updates as user types in title', async () => {
    Wrapper()
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], '张三追思会')
    expect(screen.getByText('张三追思会')).toBeInTheDocument()
    expect(screen.queryByText(t('step6.titlePlaceholder'))).not.toBeInTheDocument()
  })

  it('typing in subtitle shows it in live preview', async () => {
    Wrapper({ textConfig: { title: '追思会', subtitle: '', footer: '' } })
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[1], '1945 — 2025')
    expect(screen.getByText('1945 — 2025')).toBeInTheDocument()
  })

  it('update called with merged textConfig on title change', async () => {
    const update = vi.fn()
    render(<Step6TextConfig state={BASE} update={update} />)
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], 'A')
    expect(update).toHaveBeenLastCalledWith({
      textConfig: { title: 'A', subtitle: '', footer: '' },
    })
  })

  it('character counter increments as user types', async () => {
    Wrapper()
    expect(screen.getAllByText('0 / 40')[0]).toBeInTheDocument()
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], 'Hi')
    expect(screen.getAllByText('2 / 40')[0]).toBeInTheDocument()
  })
})
