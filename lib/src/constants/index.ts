import { Colors } from '../typings'

export const INITIAL_SETTINGS = {
  linkDistance: 100,
  linkStrength: 0.7,

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
} as Colors
