import type { WizardState, TextConfig } from '../../types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

interface FieldProps {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  required?: boolean
  maxLength?: number
}

function Field({ label, hint, value, onChange, multiline, required, maxLength = 100 }: FieldProps) {
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
          placeholder="输入内容…"
        />
      ) : (
        <input
          type="text"
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="输入内容…"
        />
      )}
    </div>
  )
}

export default function Step6TextConfig({ state, update }: Props) {
  const tc = state.textConfig
  const patch = (p: Partial<TextConfig>) => update({ textConfig: { ...tc, ...p } })

  return (
    <div className="max-w-xl">
      <p className="text-gray-500 text-sm mb-6">
        配置设计中显示的文字内容。文字将对应到背景模板的 Text Zone 区域。
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <Field
          label="主标题"
          hint="例：陈大明先生追思会"
          value={tc.title}
          onChange={(v) => patch({ title: v })}
          required
          maxLength={40}
        />

        <div className="border-t border-gray-100" />

        <Field
          label="副标题"
          hint="例：1945 — 2025 · 永远怀念"
          value={tc.subtitle}
          onChange={(v) => patch({ subtitle: v })}
          maxLength={60}
        />

        <div className="border-t border-gray-100" />

        <Field
          label="页脚文字"
          hint="例：活动时间：2025 年 3 月 15 日 上午 10 时 · 地点：XX 殡仪馆"
          value={tc.footer}
          onChange={(v) => patch({ footer: v })}
          multiline
          maxLength={120}
        />
      </div>

      {/* Live mini preview */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">文字预览</p>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-6 text-center space-y-2 min-h-[80px]">
          {tc.title ? (
            <p className="text-lg font-semibold text-gray-900">{tc.title}</p>
          ) : (
            <p className="text-lg text-gray-300 italic">主标题…</p>
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
