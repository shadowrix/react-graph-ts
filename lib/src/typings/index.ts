import type { SimulationNodeDatum } from 'd3'
import { COLORS, INITIAL_SETTINGS } from '../constants'

export type NodeType<T extends {} = {}> = {
  id: string
} & SimulationNodeDatum &
  T

export type LinkType<T extends {} = {}> = {
  id: string
  source: string
  target: string
  // curve
  drawIndex?: number
  control?: { x: number; y: number }
  curveIndex?: number
  curveGroupSize?: number
  //particles
  particleProgress?: number
  particleSpeed?: number
  particleActive?: boolean
} & T

export type HoveredData<TNode extends {} = {}, TLink extends {} = {}> = {
  link: LinkType<TNode> | null
  node: NodeType<TLink> | null
}

export type Settings = typeof INITIAL_SETTINGS

export type Colors = typeof COLORS

export type ClickType = 'right' | 'left' | 'ctrl-left' | 'ctrl-right'

export type OnClickFn<TNode extends {} = {}, TLink extends {} = {}> = (
  target: NodeType<TNode> | LinkType<TLink> | null,
  click: ClickType,
  event: MouseEvent,
) => void

export type DetectNodeColorFn<TNode extends {} = {}> = (
  target: NodeType<TNode>,
  isHover: boolean,
) => string

export type GetLabelFn<TNode extends {} = {}> = (
  target: NodeType<TNode>,
) => string
