import type { ReactNode } from 'react'

interface NavBarProps {
  title: string
  left?: ReactNode
  right?: ReactNode
}

export function NavBar({ title, left, right }: NavBarProps) {
  return (
    <div className="h-11 flex items-center justify-between text-white">
      <div className="w-8 h-8flex items-center">{left}</div>
      <span className="text-[17px] font-semibold">{title}</span>
      <div className="w-8 flex items-center justify-end">{right}</div>
    </div>
  )
}
