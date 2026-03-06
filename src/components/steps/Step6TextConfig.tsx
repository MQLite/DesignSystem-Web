import { useTranslation } from 'react-i18next'
import type { WizardState, TextConfig } from '../../types'

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
  const tc = state.textConfig
  const patch = (p: Partial<TextConfig>) => update({ textConfig: { ...tc, ...p } })

  return (
    <div className="max-w-xl">
      <p className="text-gray-500 text-sm mb-6">{t('step6.hint')}</p>

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

      {/* Live mini preview */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{t('step6.previewLabel')}</p>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-6 text-center space-y-2 min-h-[80px]">
          {tc.title ? (
            <p className="text-lg font-semibold text-gray-900">{tc.title}</p>
          ) : (
            <p className="text-lg text-gray-300 italic">{t('step6.titlePlaceholder')}</p>
          )}
          {tc.subtitle && <p className="text-sm text-gray-500">{tc.subtitle}</p>}
          {tc.footer && (
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">{tc.footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}
