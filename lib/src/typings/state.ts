import { ZoomBehavior, ZoomTransform } from 'd3-zoom'
import {
  DetectNodeColorFn,
  DrawNodeFn,
  HoveredData,
  LinkColorFn,
  LinkLabelFn,
  LinkType,
  NodeLabelFn,
  NodeType,
  OnClickFn,
  OnSelectedNodesFn,
} from '.'

import { Simulation } from 'd3-force'
import { Quadtree } from 'd3-quadtree'
import { INITIAL_SETTINGS } from '../state'

export type ExternalHandlers<TNode extends object, TLink extends object> = {
  onClick?: OnClickFn<TNode, TLink>

  nodeLabel?: NodeLabelFn<TNode>
  nodeColor?: DetectNodeColorFn<TNode>
  onSelectedNode?: OnSelectedNodesFn<TNode>
  linkColor?: LinkColorFn<TLink, TNode>
  linkLabel?: LinkLabelFn<TLink, TNode>
  drawNode?: DrawNodeFn<TNode>
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

export type ExternalState<
  TNode extends object = object,
  TLink extends object = object,
> = {
  //GRAPH SIZES
  width: number
  height: number

  nodes: NodeType<TNode>[]
  links: LinkType<TLink>[]

  settings: Partial<Settings>
  colors: Partial<Colors>
  handlers: ExternalHandlers<TNode, TLink>
}

export type State = {
  //
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null

  isRequestRendering: boolean
  simulationEngine: Simulation<NodeType, undefined> | null
  transform: ZoomTransform
  zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> | null

  //-----------------LASSO-------------------
  lassoPath: [number, number][]
  isLassoing: boolean
  //-----------------CACHE-------------------
  nodesCache: Quadtree<NodeType> | null
  linksGrid: Map<string, LinkType[]>
  //-----------------STATES-------------------
  // drag and zoom, mb rename like isProcess
  isDragging: boolean
  hoveredData: HoveredData
  particleProgress: number
  // set true when something has been changed on the graph.
  isGraphChanged: boolean
  externalState: ExternalState
  frameId: null | number

  unSubscribeFeatures: Record<string, () => void>
}
