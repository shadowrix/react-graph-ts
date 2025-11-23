import React from 'react'

import { Quadtree, Simulation, zoomIdentity, ZoomTransform } from 'd3'

import { HoveredData, LinkType, NodeType, Settings } from '../typings'
import { INITIAL_SETTINGS } from '../constants'

export type State = {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  nodes: NodeType[]
  nodesCache: Quadtree<NodeType> | null
  links: LinkType[]
  linksGrid: Map<string, LinkType[]>
  isRequestRendering: boolean
  hoveredData: HoveredData
  simulationEngine: Simulation<NodeType, undefined> | null
  transform: ZoomTransform
  //drag and zoom, mb rename like isProcess
  isDragging: boolean

  settings: Settings
}

const INITIAL_STATE = {
  canvas: null,
  context: null,
  nodes: [],
  nodesCache: null,
  links: [],
  linksGrid: new Map(),
  isRequestRendering: false,
  hoveredData: {
    link: null,
    node: null,
  },
  simulationEngine: null,
  transform: zoomIdentity,
  //drag and zoom, mb rename like isProcess
  isDragging: false,

  settings: INITIAL_SETTINGS,
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
