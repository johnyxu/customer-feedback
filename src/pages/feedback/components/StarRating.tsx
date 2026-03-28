import { useI18n } from '../../../i18n/useI18n'

interface StarRatingProps {
  value: number
  onChange: (v: number) => void
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const { t } = useI18n()

  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              'size-8 rounded-lg text-base transition-all cursor-pointer border-0',
              n <= value ? 'bg-amber-50 text-amber-400' : 'bg-gray-100 text-gray-300',
            ].join(' ')}
          >
            ★
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1.5 mb-0">{t(`rating.${value}`)}</p>
    </div>
  )
}
