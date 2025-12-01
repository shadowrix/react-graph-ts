import React from 'react'

import {
  Quadtree,
  Simulation,
  ZoomBehavior,
  zoomIdentity,
  ZoomTransform,
} from 'd3'

import {
  Colors,
  DetectNodeColorFn,
  DrawNodeFn,
  GetLabelFn,
  HoveredData,
  LinkColorFn,
  LinkLabelFn,
  LinkType,
  NodeType,
  OnSelectedNodesFn,
  Settings,
} from '../typings'
import { COLORS, INITIAL_SETTINGS } from '../constants'

export type State = {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  nodes: NodeType[]
  links: LinkType[]
  isRequestRendering: boolean
  simulationEngine: Simulation<NodeType, undefined> | null
  transform: ZoomTransform
  zoomBehavior: ZoomBehavior<HTMLCanvasElement, unknown> | null
  preRenderCb: (() => void) | null
  enablePanInteraction: boolean
  //-----------------LASSO-------------------
  lassoPath: [number, number][]
  isLassoing: boolean
  //-----------------CACHE-------------------
  nodesCache: Quadtree<NodeType> | null
  linksGrid: Map<string, LinkType[]>
  //-----------------STATES-------------------
  //drag and zoom, mb rename like isProcess
  isDragging: boolean
  hoveredData: HoveredData
  particleProgress: number

  //-----------------SETTINGS-------------------
  settings: Settings

  colors: Colors
  //-----------------Functions-------------------
  getLabel?: GetLabelFn
  nodeColor?: DetectNodeColorFn
  onSelectedNode?: OnSelectedNodesFn
  linkColor?: LinkColorFn
  linkLabel?: LinkLabelFn
  drawNode?: DrawNodeFn
}

const INITIAL_STATE = {
  canvas: null,
  context: null,
  nodes: [],
  nodesCache: null,
  links: [],
  linksGrid: new Map(),
  isRequestRendering: false,
  simulationEngine: null,
  transform: zoomIdentity,
  zoomBehavior: null,
  preRenderCb: null,
  enablePanInteraction: true,
  lassoPath: [],
  isLassoing: false,
  //drag and zoom, mb rename like isProcess
  isDragging: false,
  hoveredData: {
    link: null,
    node: null,
  },
  particleProgress: 0,

  settings: INITIAL_SETTINGS,

  colors: COLORS,
} as State

export type RefState = React.RefObject<State>

export function useRefManager() {
  const refs = React.useRef<State>(INITIAL_STATE)

  const register =
    <T extends keyof State>(name: T) =>
    (element: State[T]) => {
      refs.current[name] = element
    }

  return { refs, register }
}
