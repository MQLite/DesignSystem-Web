import { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardState, TextZone, TextZoneStyle } from '../../types'
import DesignCanvas from '../DesignCanvas'
import { parseSlots } from '../../utils/slotUtils'

function parseTextZones(json: string | null | undefined): TextZone[] {
  if (!json) return []
  try { return JSON.parse(json) as TextZone[] } catch { return [] }
}

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

interface FieldProps {
  label: string
  hint: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  required?: boolean
  maxLength?: number
}

function Field({ label, hint, placeholder, value, onChange, multiline, required, maxLength = 100 }: FieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <span className="text-xs text-gray-400">
          {value.length} / {maxLength}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      {multiline ? (
        <textarea
          rows={3}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

/** Map known zone IDs to i18n keys that already exist. */
function useZoneI18n(zoneId: string) {
  const { t } = useTranslation()
  const known: Record<string, { label: string; hint: string; maxLength: number }> = {
    title:    { label: t('step6.titleField.label'),    hint: t('step6.titleField.hint'),    maxLength: 40 },
    subtitle: { label: t('step6.subtitleField.label'), hint: t('step6.subtitleField.hint'), maxLength: 60 },
    footer:   { label: t('step6.footerField.label'),   hint: t('step6.footerField.hint'),   maxLength: 120 },
  }
  return known[zoneId] ?? {
    label: zoneId.charAt(0).toUpperCase() + zoneId.slice(1),
    hint: '',
    maxLength: 100,
  }
}

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'Courier New', 'Verdana', 'Trebuchet MS', 'Impact',
]

/** Per-zone typography override controls shown below the text input. */
function ZoneStyleControls({
  zone,
  overrides,
  onChange,
}: {
  zone: TextZone
  overrides: TextZoneStyle
  onChange: (patch: Partial<TextZoneStyle>) => void
}) {
  const effectiveFontSize   = overrides.fontSize    ?? zone.fontSize    ?? 50
  const effectiveFontFamily = overrides.fontFamily  ?? zone.fontFamily  ?? 'Arial'
  const effectiveColor      = overrides.color       ?? zone.color       ?? '#ffffff'
  const effectiveStrokeW    = overrides.strokeWidth ?? zone.strokeWidth ?? 0
  const effectiveStrokeC    = overrides.strokeColor ?? zone.strokeColor ?? '#000000'
  const effectiveAlign      = overrides.align       ?? zone.align       ?? 'center'

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Typography</p>
      {/* Font family */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-16 flex-shrink-0">Font</label>
        <select
          value={effectiveFontFamily}
          onChange={e => onChange({ fontFamily: e.target.value })}
          className="flex-1 px-1.5 py-0.5 border border-gray-300 rounded text-xs"
        >
          {FONT_FAMILIES.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      {/* Font size */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-16 flex-shrink-0">Size %</label>
        <input
          type="range" min={20} max={150} step={1}
          value={effectiveFontSize}
          onChange={e => onChange({ fontSize: Number(e.target.value) })}
          className="flex-1 accent-indigo-500"
        />
        <span className="w-7 text-right text-xs font-mono text-gray-600">{effectiveFontSize}</span>
      </div>
      {/* Color + Align */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 w-16 flex-shrink-0">Color</label>
        <input
          type="color"
          value={effectiveColor}
          onChange={e => onChange({ color: e.target.value })}
          className="w-7 h-7 rounded border-0 p-0 cursor-pointer"
        />
        <span className="text-xs font-mono text-gray-400">{effectiveColor}</span>
        <div className="ml-auto flex gap-0.5">
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              onClick={() => onChange({ align: a })}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                effectiveAlign === a
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'text-gray-500 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {a === 'left' ? 'L' : a === 'right' ? 'R' : 'C'}
            </button>
          ))}
        </div>
      </div>
      {/* Stroke width */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-16 flex-shrink-0">Stroke %</label>
        <input
          type="range" min={0} max={20} step={0.5}
          value={effectiveStrokeW}
          onChange={e => onChange({ strokeWidth: Number(e.target.value) })}
          className="flex-1 accent-indigo-500"
        />
        <span className="w-7 text-right text-xs font-mono text-gray-600">{effectiveStrokeW}</span>
      </div>
      {/* Stroke color (only when stroke active) */}
      {effectiveStrokeW > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-16 flex-shrink-0">Stroke</label>
          <input
            type="color"
            value={effectiveStrokeC}
            onChange={e => onChange({ strokeColor: e.target.value })}
            className="w-7 h-7 rounded border-0 p-0 cursor-pointer"
          />
          <span className="text-xs font-mono text-gray-400">{effectiveStrokeC}</span>
        </div>
      )}
    </div>
  )
}

function ZoneField({
  zone, value, onChange, overrides, onStyleChange, required,
}: {
  zone: TextZone
  value: string
  onChange: (v: string) => void
  overrides: TextZoneStyle
  onStyleChange: (patch: Partial<TextZoneStyle>) => void
  required?: boolean
}) {
  const { t } = useTranslation()
  const i18n = useZoneI18n(zone.id)
  const multiline = zone.h > 0.12
  return (
    <div>
      <Field
        label={i18n.label}
        hint={i18n.hint}
        placeholder={zone.defaultText ?? t('common.inputPlaceholder')}
        value={value}
        onChange={onChange}
        multiline={multiline}
        required={required}
        maxLength={i18n.maxLength}
      />
      <ZoneStyleControls zone={zone} overrides={overrides} onChange={onStyleChange} />
    </div>
  )
}

export default function Step6TextConfig({ state, update }: Props) {
  const { t } = useTranslation()
  const {
    textConfig: tc,
    textStyleOverrides,
    selectedBackground,
    customBackgroundUrl,
    subjectPreviewUrl,
    canvasLayout,
    subjectCropStates,
    selectedLayoutId,
  } = state

  const primaryCropState = subjectCropStates[0] ?? null
  const selectedLayout = selectedBackground?.layout.find((l) => l.id === selectedLayoutId)
  const slots = parseSlots(selectedLayout?.subjectSlotsJson)
  const textZones = parseTextZones(selectedLayout?.textZonesJson)

  // Pre-fill textConfig from zone.defaultText when the field is empty
  useEffect(() => {
    const patch: Record<string, string> = {}
    textZones.forEach(zone => {
      if (zone.defaultText && !tc[zone.id]) {
        patch[zone.id] = zone.defaultText
      }
    })
    if (Object.keys(patch).length > 0) {
      update({ textConfig: { ...tc, ...patch } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayoutId])

  const setField = (id: string, value: string) =>
    update({ textConfig: { ...tc, [id]: value } })

  const setStyle = (id: string, patch: Partial<TextZoneStyle>) =>
    update({
      textStyleOverrides: {
        ...textStyleOverrides,
        [id]: { ...(textStyleOverrides[id] ?? {}), ...patch },
      },
    })

  const effectiveBgUrl =
    customBackgroundUrl ??
    (selectedBackground?.previewPath ? `/${selectedBackground.previewPath}` : null)

  return (
    <div className="max-w-5xl">
      <p className="text-gray-500 text-sm mb-6">{t('step6.hint')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: input fields — one per text zone defined in the template */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {textZones.length === 0 && (
              <p className="text-sm text-gray-400 italic">{t('step6.noZones')}</p>
            )}
            {textZones.map((zone, i) => (
              <Fragment key={zone.id}>
                {i > 0 && <div className="border-t border-gray-100" />}
                <ZoneField
                  zone={zone}
                  value={tc[zone.id] ?? ''}
                  onChange={(v) => setField(zone.id, v)}
                  overrides={textStyleOverrides[zone.id] ?? {}}
                  onStyleChange={(patch) => setStyle(zone.id, patch)}
                  required={i === 0}
                />
              </Fragment>
            ))}
          </div>
        </div>

        {/* Right: interactive canvas */}
        <div className="lg:col-span-3">
          <DesignCanvas
            backgroundUrl={effectiveBgUrl}
            subjectUrl={subjectPreviewUrl}
            subjectCropState={primaryCropState}
            slots={slots}
            textConfig={tc}
            textZones={textZones}
            textStyleOverrides={textStyleOverrides}
            layoutAspectRatio={selectedLayout ? selectedLayout.widthMm / selectedLayout.heightMm : undefined}
            layout={canvasLayout}
            onLayoutChange={(l) => update({ canvasLayout: l })}
            watermark={t('step7.pocPreview')}
          />
        </div>
      </div>
    </div>
  )
}
