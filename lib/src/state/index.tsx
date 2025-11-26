import React from 'react'

import { Quadtree, Simulation, zoomIdentity, ZoomTransform } from 'd3'

import { Colors, HoveredData, LinkType, NodeType, Settings } from '../typings'
import { COLORS, INITIAL_SETTINGS } from '../constants'

export type State = {
  canvas: HTMLCanvasElement | null
  context: CanvasRenderingContext2D | null
  nodes: NodeType[]
  links: LinkType[]
  isRequestRendering: boolean
  simulationEngine: Simulation<NodeType, undefined> | null
  transform: ZoomTransform
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

  function clear() {
    for (const [key, value] of Object.entries(INITIAL_STATE)) {
      //TODO: Исправить типизацию
      refs.current[key as keyof State] = value as never
    }
  }

  return { refs, register, clear }
}
