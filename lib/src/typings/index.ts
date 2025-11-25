import type { SimulationNodeDatum } from 'd3'
import { COLORS, INITIAL_SETTINGS } from '../constants'

export type NodeType = {
  id: string
} & SimulationNodeDatum

export type LinkType = {
  id: string
  source: string
  target: string
  control?: { x: number; y: number }
  drawIndex?: number
  curveIndex?: number
  curveGroupSize?: number
}

export type HoveredData = {
  link: LinkType | null
  node: NodeType | null
}

export type Settings = typeof INITIAL_SETTINGS

export type Colors = typeof COLORS

export type ClickType = 'right' | 'left' | 'ctrl-left' | 'ctrl-right'

export type OnClickFn = (
  target: NodeType | LinkType | null,
  click: ClickType,
  event: MouseEvent,
) => void

export type DetectNodeColorFn = (target: NodeType, isHover: boolean) => string
