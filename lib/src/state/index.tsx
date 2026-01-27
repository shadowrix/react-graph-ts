import { zoomIdentity } from 'd3-zoom'
import { ExternalState, State } from '../typings/state'

export const INITIAL_SETTINGS = {
  linkDistance: 100,
  linkStrength: 0.7,

  linkWidth: 1,
  arrowSize: 14,

  nodeRadius: 8,
  hoveredBorder: 4,

  alphaDecay: 0.05,

  isFixed: false,
  isFixedNodeAfterDrag: true,

  //Particles of link
  particlesSpeed: 0.015,
  particlesSize: 3,
  withParticles: true,

  isDashed: false,
  withNodeLabels: true,
  withLinksArrows: true,
}

export const COLORS = {
  background: '#2d313a',

  node: '#4b5bbe',
  nodeHover: '#ec69b3',
  nodeActive: '#DDB67D',

  link: '#5F74C2',
  linkHover: '#ec69b3',
  linkActive: '#DDB67D',

  nodeLabel: '#D9DBE0',

  particles: '#ff1974',

  arrow: undefined,
}

export const INITIAL_STATE = {
  //GRAPH SIZES
  //
  canvas: null,
  context: null,

  nodesCache: null,
  linksGrid: new Map(),
  isRequestRendering: false,
  simulationEngine: null,
  transform: zoomIdentity,
  zoomBehavior: null,
  lassoPath: [],
  isLassoing: false,
  //drag and zoom, mb rename like isProcess
  isDragging: false,
  hoveredData: {
    link: null,
    node: null,
  },
  particleProgress: 0,

  isGraphChanged: true,

  externalState: {
    width: 0,
    height: 0,
    nodes: [],
    links: [],
    settings: INITIAL_SETTINGS,
    colors: COLORS,
    handlers: {},
  },

  frameId: null,

  unSubscribeFeatures: {},
} as State

export function getState<TNode extends object, TLink extends object>(
  initialState?: Partial<ExternalState<TNode, TLink>>,
) {
  const state = {
    ...INITIAL_STATE,
    externalState: {
      ...INITIAL_STATE.externalState,
      ...(initialState ?? {}),
      settings: {
        ...(initialState?.settings ?? {}),
        ...INITIAL_STATE.externalState.settings,
      },
      colors: {
        ...(initialState?.colors ?? {}),
        ...INITIAL_STATE.externalState.colors,
      },
    },
  }

  return JSON.parse(JSON.stringify(state)) as State
}
