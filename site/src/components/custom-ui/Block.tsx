import { cn } from '@/lib/utils'
import type React from 'react'

export type Props = React.PropsWithChildren<{
  label?: string
  className?: string
}>

export function Block(props: Props) {
  return (
    <div
      className={cn(
        'w-full flex flex-col bg-[#1c2029] rounded-2xl p-4 shadow-md',
        props.className,
      )}
    >
      {props.label && (
        <h2 className="text-xl text-white font-semibold mb-4">{props.label}</h2>
      )}
      {props.children}
    </div>
  )
}
