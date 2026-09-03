'use client'

import { Mic } from 'lucide-react'

import { cn } from '@/lib/utils'

interface IconRippleProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ size?: number; color?: string; className?: string }>
  iconSize?: number
  iconColor?: string
  borderColor?: string
  inset?: string
}

export default function IconRipple({
  icon: Icon = Mic,
  iconSize = 32,
  iconColor = '#ddd',
  borderColor = '#ff2c59',
  inset = '5px',
}: IconRippleProps) {
  const customBorderStyle = {
    borderColor,
  }
  const insetStyle = {
    top: `-${inset}`,
    bottom: `-${inset}`,
    left: `-${inset}`,
    right: `-${inset}`,
  }

  return (
    <div className={cn('group relative flex items-center justify-center')}>
      <Icon size={iconSize} color={iconColor} />
      <div
        className={cn('absolute -inset-4 animate-ping rounded-full border-2')}
        style={{ ...customBorderStyle, ...insetStyle }}
      />
    </div>
  )
}
