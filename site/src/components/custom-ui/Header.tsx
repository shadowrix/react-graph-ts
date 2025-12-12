import React from 'react'
import { Separator } from '../ui/separator'
import { Block } from './Block'
import { Switch } from './Switch'

const ROUTES = [
  {
    label: 'example',
    href: '/',
  },
  {
    label: 'docs',
    href: '/docs',
  },
]

export function Header() {
  return (
    <Block className="flex flex-row items-center justify-between">
      <div className="font-bold text-2xl text-[#bbbfca]">react-graph-ts</div>
      <div className="h-full flex flex-row gap-6">
        {ROUTES.map((route, index) => {
          return (
            <React.Fragment key={route.href}>
              <div className="font-semibold cursor-pointer hover:text-sky-700">
                {route.label}
              </div>
              {index % 2 === 0 && (
                <Separator orientation="vertical" className="h-full" />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <Switch label="Night Mode" />
    </Block>
  )
}
