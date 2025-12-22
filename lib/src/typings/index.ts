import { INITIAL_SETTINGS } from '../constants'

export type NodeType<T extends object = object> = {
  id: string
  index?: number | undefined
  x?: number | undefined
  y?: number | undefined
  vx?: number | undefined
  vy?: number | undefined
  fx?: number | null | undefined
  fy?: number | null | undefined
} & T

export type LinkSettings = {
  color?: string
  withArrow?: boolean
  isDashed?: boolean
  withParticles?: boolean
  width?: number
}

export type LinkViewSettings = {
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  tStart?: { x: number; y: number }
  tEnd?: { x: number; y: number }
  curveIndex?: number
  curveGroupSize?: number
  isSelf?: boolean
}

export type LinkType<
  TLink extends object = object,
  TNode extends object = object,
> = {
  id: string
  source: string | NodeType<TNode>
  target: string | NodeType<TNode>
  // curve
  control?: { x: number; y: number }
  control2?: { x: number; y: number }
  drawIndex?: number
  //settings
  settings?: LinkSettings
  //view data
  _viewSettings?: LinkViewSettings
} & TLink

export type HoveredData<
  TNode extends object = object,
  TLink extends object = object,
> = {
  node: NodeType<TNode> | null
  link: LinkType<TLink, TNode> | null
  pointer?: { x?: number; y?: number } | null
}

export type Settings = typeof INITIAL_SETTINGS

export type Colors = {
  background: string

  node: string
  nodeHover: string
  nodeActive: string

  link: string
  linkHover: string
  linkActive: string

  nodeLabel: string

  particles: string

  arrow?: string
}

export type ClickedButton = 'right' | 'left' | 'ctrl-left' | 'ctrl-right'

export type ClickArea = 'background' | 'node' | 'link'

export type OnClickFn<
  TNode extends object = object,
  TLink extends object = object,
> = (
  target: NodeType<TNode> | LinkType<TLink, TNode> | null,
  clickArea: ClickArea,
  clickedButton: ClickedButton,
  event: MouseEvent,
) => void

export type LinkLabelFn<
  TLink extends object = object,
  TNode extends object = object,
> = (link: LinkType<TLink, TNode>) => string

export type LinkColorFn<
  TLink extends object = object,
  TNode extends object = object,
> = (target: LinkType<TLink, TNode>, isHover: boolean) => string

export type DetectNodeColorFn<TNode extends object = object> = (
  target: NodeType<TNode>,
  isHover: boolean,
) => string

export type OnSelectedNodesFn<TNode extends object = object> = (
  nodes: NodeType<TNode>[],
) => void

export type DrawNodeFn<TNode extends object = object> = (
  context: CanvasRenderingContext2D,
  node: NodeType<TNode>,
  drawNode: () => void,
) => void

export type NodeLabelFn<TNode extends object = object> = (
  target: NodeType<TNode>,
) => string

export type GraphRef = {
  getPointerCoords: (x: number, y: number) => [number, number]
  zoom: (scale: number, duration?: number) => void
  centerAt: (
    x: number,
    y: number,
    transform?: number,
    duration?: number,
  ) => void
}
