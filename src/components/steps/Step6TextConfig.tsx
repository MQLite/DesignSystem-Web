import { useTranslation } from 'react-i18next'
import type { WizardState, TextConfig } from '../../types'
import DesignCanvas from '../DesignCanvas'

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

export default function Step6TextConfig({ state, update }: Props) {
  const { t } = useTranslation()
  const { textConfig: tc, selectedBackground, customBackgroundUrl, subjectPreviewUrl, canvasLayout } = state
  const patch = (p: Partial<TextConfig>) => update({ textConfig: { ...tc, ...p } })

  const effectiveBgUrl = customBackgroundUrl
    ?? (selectedBackground?.previewPath ? `/${selectedBackground.previewPath}` : null)

  return (
    <div className="max-w-5xl">
      <p className="text-gray-500 text-sm mb-6">{t('step6.hint')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: input fields */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <Field
              label={t('step6.titleField.label')}
              hint={t('step6.titleField.hint')}
              placeholder={t('common.inputPlaceholder')}
              value={tc.title}
              onChange={(v) => patch({ title: v })}
              required
              maxLength={40}
            />
            <div className="border-t border-gray-100" />
            <Field
              label={t('step6.subtitleField.label')}
              hint={t('step6.subtitleField.hint')}
              placeholder={t('common.inputPlaceholder')}
              value={tc.subtitle}
              onChange={(v) => patch({ subtitle: v })}
              maxLength={60}
            />
            <div className="border-t border-gray-100" />
            <Field
              label={t('step6.footerField.label')}
              hint={t('step6.footerField.hint')}
              placeholder={t('common.inputPlaceholder')}
              value={tc.footer}
              onChange={(v) => patch({ footer: v })}
              multiline
              maxLength={120}
            />
          </div>
        </div>

        {/* Right: interactive canvas + toolbar */}
        <div className="lg:col-span-3">
          <DesignCanvas
            backgroundUrl={effectiveBgUrl}
            subjectUrl={subjectPreviewUrl}
            textConfig={tc}
            layout={canvasLayout}
            onLayoutChange={(l) => update({ canvasLayout: l })}
            watermark={t('step7.pocPreview')}
          />
        </div>
      </div>
    </div>
  )
}
