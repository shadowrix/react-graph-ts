import React from 'react'

import { Label } from '@/components/ui/label'
import { UiSwitch } from '@/components/ui/switch'

export type Props = {
  value?: boolean
  className?: string
  label?: string
  onChange?: (event?: React.FormEvent<HTMLButtonElement>) => void
}

export function Switch(props: Props) {
  const id = React.useId()

  return (
    <div className="flex items-center space-x-2">
      <UiSwitch
        id={id}
        checked={props.value}
        onChange={props.onChange}
        className="cursor-pointer"
      />
      {props.label && (
        <Label htmlFor={id} className="cursor-pointer">
          {props.label}
        </Label>
      )}
    </div>
  )
}
