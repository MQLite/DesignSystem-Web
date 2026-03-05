interface Props {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <ol className="space-y-0.5">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < currentStep
        const active = n === currentStep
        return (
          <li
            key={n}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              active ? 'bg-indigo-600/20' : ''
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                done
                  ? 'bg-indigo-500 text-white'
                  : active
                  ? 'bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {done ? '✓' : n}
            </span>
            <span
              className={`text-sm leading-tight ${
                active ? 'text-white font-medium' : done ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
