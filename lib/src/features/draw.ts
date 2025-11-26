import { RefState } from '../state'
import { computeControlPoint } from './handlers'
import {
  DetectNodeColorFn,
  GetLabelFn,
  LinkColorFn,
  LinkType,
  NodeType,
} from '../typings'

//TODO: Add all settings for links and mb custom links
export function drawLink(
  state: RefState,
  link: LinkType,
  linkColor: LinkColorFn,
) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  const isHovered =
    state.current!.hoveredData.link?.id === link.id ||
    state.current!.hoveredData.node?.id === source.id ||
    state.current!.hoveredData.node?.id === target.id

  if (
    !source?.x ||
    !target?.x ||
    !source?.y ||
    !target?.y ||
    !state.current!.context
  )
    return

  const sx = source.x
  const sy = source.y
  const tx = target.x
  const ty = target.y

  // if (link.curveGroupSize === 1) {
  //   state.current!.context.beginPath()
  //   state.current!.context.moveTo(sx, sy)
  //   state.current!.context.lineTo(tx, ty)
  //   setLineSettings()
  //   state.current!.context.stroke()
  //   return
  // }

  // if (!link.control)
  link.control = computeControlPoint(source, target, link.curveIndex ?? 0)
  const cp = link.control

  state.current!.context.beginPath()
  state.current!.context.moveTo(sx, sy)
  state.current!.context.quadraticCurveTo(cp.x, cp.y, tx, ty)

  if (state.current!.settings.isDashed) {
    state.current!.context!.setLineDash([10, 5])
  }
  state.current!.context!.strokeStyle = linkColor(link, false)
  state.current!.context!.lineWidth = 1
  if (isHovered) {
    state.current!.context!.lineWidth = 2
    state.current!.context!.strokeStyle = linkColor(link, true)
  }

  state.current!.context.stroke()

  if (isHovered && state.current!.settings.withParticles) {
    drawCurvedLinkParticle(state, link, cp.x, cp.y)
  }
}

export function drawAllLinks(state: RefState, linkColor: LinkColorFn) {
  if (state.current!.hoveredData.link || state.current!.hoveredData.node) {
    state.current!.particleProgress =
      state.current!.particleProgress + state.current!.settings.particlesSpeed

    if (state.current!.particleProgress > 1) {
      state.current!.particleProgress = 0
    }
  } else {
    state.current!.particleProgress = 0
  }
  for (let index = 0; index < state.current!.links.length; index++) {
    const link = state.current!.links[index]

    drawLink(state, link, linkColor)

    link.drawIndex = index
  }
}

//TODO: Add all settings for node and custom nodes
export function drawNode(
  state: RefState,
  node: NodeType,
  radius: number,
  detectNodeColorFn: DetectNodeColorFn,
  getLabel: GetLabelFn,
) {
  const x = node.x!
  const y = node.y!
  const context = state.current!.context!

  const isHovered =
    state.current!.hoveredData.node?.id === node.id ||
    (state.current!.hoveredData.link?.source as unknown as NodeType)?.id ===
      node.id ||
    (state.current!.hoveredData.link?.target as unknown as NodeType)?.id ===
      node.id

  context.beginPath()
  context.fillStyle = detectNodeColorFn
    ? detectNodeColorFn(node, false)
    : state.current!.colors.node
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (isHovered) {
    context.strokeStyle = state.current!.colors.nodeHover
    context.lineWidth = state.current!.settings.hoveredBorder
    context.stroke()
  }
  context.fill()

  const label = getLabel(node)
  if (state.current!.transform.k < 0.6 || !label) return

  // label
  context.font = '12px sans-serif'
  context.fillStyle = state.current!.colors.nodeLabel
  context.textBaseline = 'bottom'
  context.textAlign = 'center'
  context.fillText(label, x, y - radius - 6)
}

export function drawAllNodes(
  state: RefState,
  radius: number,
  getLabel: GetLabelFn,
  detectNodeColorFn: DetectNodeColorFn,
) {
  if (!state.current!.context) return

  for (const node of state.current!.nodes) {
    drawNode(state, node, radius, detectNodeColorFn, getLabel)
  }
}

function drawCurvedLinkParticle(
  state: RefState,
  link: LinkType,
  controlX: number,
  controlY: number,
) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  const sx = source.x!
  const sy = source.y!
  const tx = target.x!
  const ty = target.y!

  const p = getPointOnQuadraticCurve(
    sx,
    sy,
    controlX,
    controlY,
    tx,
    ty,
    state.current!.particleProgress,
  )

  state.current!.context!.beginPath()
  state.current!.context!.arc(
    p.x,
    p.y,
    state.current!.settings.particlesSize,
    0,
    Math.PI * 2,
  )
  state.current!.context!.fillStyle = state.current!.colors.particles
  state.current!.context!.fill()
}

function getPointOnQuadraticCurve(
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  t: number,
) {
  const mt = 1 - t

  const x = mt * mt * sx + 2 * mt * t * cx + t * t * tx

  const y = mt * mt * sy + 2 * mt * t * cy + t * t * ty

  return { x, y }
}
