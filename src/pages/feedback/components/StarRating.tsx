import { I18N_KEYS, type I18nKey } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

const RATING_KEY_BY_VALUE: Record<number, I18nKey> = {
  1: I18N_KEYS.RATING_1,
  2: I18N_KEYS.RATING_2,
  3: I18N_KEYS.RATING_3,
  4: I18N_KEYS.RATING_4,
  5: I18N_KEYS.RATING_5,
}

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
      <p className="text-xs text-gray-400 mt-1.5 mb-0">{t(RATING_KEY_BY_VALUE[value] ?? I18N_KEYS.RATING_5)}</p>
    </div>
  )
}
