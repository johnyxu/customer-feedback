import type { ReactNode } from 'react'

interface SectionHeaderProps {
  icon: ReactNode
  title: string
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="size-6 rounded-[7px] bg-violet-100 text-violet-700 flex items-center justify-center text-xs shrink-0">
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-900">{title}</span>
    </div>
  )
}
