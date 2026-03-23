import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import i18n from '../i18n'
import Step6TextConfig from '../components/steps/Step6TextConfig'
import type { WizardState } from '../types'

const { t } = i18n

const MOCK_ZONES = JSON.stringify([
  { id: 'title',  x: 0.05, y: 0.02, w: 0.90, h: 0.10 },
  { id: 'footer', x: 0.05, y: 0.78, w: 0.90, h: 0.20 },
])

const MOCK_BG = {
  id: 'bg-1', name: 'Test BG', occasionType: 'Funeral',
  previewPath: null, sourcePath: null,
  layout: [{
    id: 'layout-1', sizeCode: 'A3', widthMm: 297, heightMm: 420,
    orientation: 'Portrait',
    subjectSlotsJson: '[]',
    textZonesJson: MOCK_ZONES,
    version: 1,
  }],
}

const BASE: WizardState = {
  step: 6, productType: 'PvcBanner', sizeCode: 'A3', occasionType: 'Funeral',
  selectedBackground: MOCK_BG, selectedLayoutId: 'layout-1', customBackgroundUrl: null,
  subjectAssetId: null, subjectPreviewUrl: null,
  textConfig: {},
  canvasLayout: { background: { x: 0, y: 0, scale: 1, rotation: 0 }, subject: { x: 0, y: 0, scale: 1, rotation: 0 }, title: { x: 0, y: 0, scale: 1, rotation: 0 }, subtitle: { x: 0, y: 0, scale: 1, rotation: 0 }, footer: { x: 0, y: 0, scale: 1, rotation: 0 } }, subjectCropStates: [],
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
  it('renders fields for each text zone defined in the layout', () => {
    Wrapper()
    expect(screen.getByText(t('step6.titleField.label'))).toBeInTheDocument()
    expect(screen.getByText(t('step6.footerField.label'))).toBeInTheDocument()
  })

  it('does not render a subtitle field when the layout has no subtitle zone', () => {
    Wrapper()
    expect(screen.queryByText(t('step6.subtitleField.label'))).not.toBeInTheDocument()
  })

  it('first field is marked required', () => {
    Wrapper()
    const asterisks = document.querySelectorAll('span.text-red-500')
    expect(asterisks.length).toBeGreaterThanOrEqual(1)
  })

  it('live preview updates as user types in title', async () => {
    Wrapper()
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], '张三追思会')
    expect(screen.getByText('张三追思会')).toBeInTheDocument()
  })

  it('update called with merged textConfig on title change', async () => {
    const update = vi.fn()
    render(<Step6TextConfig state={BASE} update={update} />)
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], 'A')
    expect(update).toHaveBeenLastCalledWith({
      textConfig: { title: 'A' },
    })
  })

  it('character counter increments as user types', async () => {
    Wrapper()
    expect(screen.getAllByText('0 / 40')[0]).toBeInTheDocument()
    const inputs = screen.getAllByPlaceholderText(t('common.inputPlaceholder'))
    await userEvent.type(inputs[0], 'Hi')
    expect(screen.getAllByText('2 / 40')[0]).toBeInTheDocument()
  })

  it('shows no-zones message when selected layout has no text zones', () => {
    const noZonesBg = {
      ...MOCK_BG,
      layout: [{ ...MOCK_BG.layout[0], textZonesJson: null }],
    }
    Wrapper({ selectedBackground: noZonesBg })
    expect(screen.getByText(t('step6.noZones'))).toBeInTheDocument()
  })
})
