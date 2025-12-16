import { cn } from '@/lib/utils'
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from '../ui/select'

export type SelectItem = {
  value: string
  label: string
}

export type SelectProps = {
  items: SelectItem[]
  value?: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
}

export function Select(props: SelectProps) {
  return (
    <ShadcnSelect onValueChange={props.onChange} value={props.value}>
      <SelectTrigger className={cn('w-full', props.className)}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.items.map((item) => {
          return (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </ShadcnSelect>
  )
}
