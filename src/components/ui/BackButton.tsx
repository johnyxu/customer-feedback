import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

type Props = {
  to?: string
  variant?: 'default' | 'dark'
}

export function BackButton({ to, variant = 'default' }: Props) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  const cls =
    variant === 'dark'
      ? 'flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white'
      : 'flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600'

  return (
    <button type="button" onClick={handleClick} className={cls} aria-label="back">
      <ChevronLeft size={24} strokeWidth={2.5} />
    </button>
  )
}
