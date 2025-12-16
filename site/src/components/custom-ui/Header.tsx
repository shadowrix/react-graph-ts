import React from 'react'
import { NavLink } from 'react-router'

import { Separator } from '../ui/separator'
import { Block } from './Block'
// import { Switch } from './Switch'
import { cn } from '@/lib/utils'
import { PREFIX_ROUTE } from '@/constants'

const ROUTES = [
  {
    label: 'Example',
    href: '/',
  },
  {
    label: 'Docs',
    href: '/docs',
  },
]

export function Header() {
  return (
    <Block className="h-16 flex flex-row items-center justify-between">
      <div className="font-bold text-2xl text-[#bbbfca]">react-graph-ts</div>
      <div className="h-full flex flex-row gap-6 items-center">
        {ROUTES.map((route, index) => {
          return (
            <React.Fragment key={route.href}>
              <NavLink
                end
                to={`/${PREFIX_ROUTE}${route.href}`}
                className={({ isActive }) =>
                  cn(
                    'font-semibold cursor-pointer hover:text-[#e3a7c9]',
                    isActive ? 'text-[#ec69b3]' : '',
                  )
                }
              >
                {route.label}
              </NavLink>
              {index % 2 === 0 && (
                <Separator orientation="vertical" className="max-h-5" />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div></div>
      {/* <Switch label="Night Mode" /> */}
    </Block>
  )
}
