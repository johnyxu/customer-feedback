import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-[14px] mx-4 mb-3 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${className}`}>
      {children}
    </div>
  )
}
