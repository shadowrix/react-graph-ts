import type { SimulationNodeDatum } from 'd3'
import { INITIAL_SETTINGS } from '../constants'

export type NodeType = {
  id: string
} & SimulationNodeDatum

export type LinkType = {
  id: string
  source: string
  target: string
  drawIndex?: number
}

export type HoveredData = {
  link: LinkType | null
  node: NodeType | null
}

export type Settings = typeof INITIAL_SETTINGS

export type ClickType = 'right' | 'left' | 'ctrl-left' | 'ctrl-right'

export type OnClickFn = (
  target: NodeType | LinkType | null,
  click: ClickType,
  event: MouseEvent,
) => void
