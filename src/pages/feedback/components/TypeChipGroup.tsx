import { useI18n } from '../../../i18n/useI18n'

const FEEDBACK_TYPES = [
  { id: 'bug', labelKey: 'feedback.type.bug' },
  { id: 'feature', labelKey: 'feedback.type.feature' },
  { id: 'experience', labelKey: 'feedback.type.experience' },
  { id: 'other', labelKey: 'feedback.type.other' },
] as const

export type FeedbackTypeId = (typeof FEEDBACK_TYPES)[number]['id']

interface TypeChipGroupProps {
  value: FeedbackTypeId
  onChange: (v: FeedbackTypeId) => void
}

export function TypeChipGroup({ value, onChange }: TypeChipGroupProps) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {FEEDBACK_TYPES.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={[
            'rounded-xl py-[11px] px-2.5 text-[13px] font-semibold text-center transition-all border-[1.5px] cursor-pointer',
            value === item.id
              ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-[0_0_0_2px_rgba(124,58,237,0.08)]'
              : 'border-gray-200 bg-white text-gray-600',
          ].join(' ')}
        >
          {t(item.labelKey)}
        </button>
      ))}
    </div>
  )
}
