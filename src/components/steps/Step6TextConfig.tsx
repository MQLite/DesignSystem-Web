import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { WizardState, SubjectSlot, TextZone } from '../../types'
import DesignCanvas from '../DesignCanvas'

function parseSlots(json: string | null | undefined): SubjectSlot[] {
  if (!json) return []
  try { return JSON.parse(json) as SubjectSlot[] } catch { return [] }
}

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

function ZoneField({
  zone, value, onChange, required,
}: { zone: TextZone; value: string; onChange: (v: string) => void; required?: boolean }) {
  const { t } = useTranslation()
  const i18n = useZoneI18n(zone.id)
  // Treat as multiline when zone height represents roughly > 1 text line (h > 0.12 of canvas)
  const multiline = zone.h > 0.12
  return (
    <Field
      label={i18n.label}
      hint={i18n.hint}
      placeholder={t('common.inputPlaceholder')}
      value={value}
      onChange={onChange}
      multiline={multiline}
      required={required}
      maxLength={i18n.maxLength}
    />
  )
}

export default function Step6TextConfig({ state, update }: Props) {
  const { t } = useTranslation()
  const {
    textConfig: tc,
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

  const setField = (id: string, value: string) =>
    update({ textConfig: { ...tc, [id]: value } })

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
