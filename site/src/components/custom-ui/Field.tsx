import { cn } from '@/lib/utils'
import type React from 'react'

export type Props = React.PropsWithChildren<{
  className?: string
  label?: string
}>

export function Field(props: Props) {
  return (
    <div className={cn('w-full flex flex-col gap-1', props.className)}>
      {props.label && (
        <div className="block text-sm text-[#bbbfca]">{props.label}</div>
      )}
      {props.children}
    </div>
  )
}
