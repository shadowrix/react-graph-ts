import { RefState } from '../state'
import { computeControlPoint } from './handlers'
import {
  DetectNodeColorFn,
  GetLabelFn,
  LinkColorFn,
  LinkLabelFn,
  LinkType,
  NodeType,
} from '../typings'

//TODO: Add all settings for links and mb custom links
export function drawLink(state: RefState, link: LinkType) {
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

  state.current!.context!.setLineDash([])
  if (state.current!.settings.isDashed) {
    state.current!.context!.setLineDash([10, 5])
  }
  state.current!.context!.strokeStyle = state.current!.linkColor!(link, false)
  state.current!.context!.lineWidth = 1
  if (isHovered) {
    state.current!.context!.lineWidth = 2
    state.current!.context!.strokeStyle = state.current!.linkColor!(link, true)
  }

  state.current!.context.stroke()

  if (isHovered) {
    if (state.current!.settings.withParticles) {
      drawCurvedLinkParticle(state, link, cp.x, cp.y)
    }
  }
}

export function drawAllLinks(state: RefState) {
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

    drawLink(state, link)

    link.drawIndex = index
  }
}

//TODO: Add all settings for node and custom nodes
export function drawNode(state: RefState, node: NodeType, radius: number) {
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
  context.fillStyle = state.current!.nodeColor
    ? state.current!.nodeColor(node, false)
    : state.current!.colors.node
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (isHovered) {
    context.strokeStyle = state.current!.colors.nodeHover
    context.lineWidth = state.current!.settings.hoveredBorder
    context.stroke()
  }
  context.fill()

  const label = state.current!.getLabel?.(node)
  if (state.current!.transform.k < 0.6 || !label) return

  // label
  context.font = '12px sans-serif'
  context.fillStyle = state.current!.colors.nodeLabel
  context.textBaseline = 'bottom'
  context.textAlign = 'center'
  context.fillText(label, x, y - radius - 6)
}

export function drawAllNodes(state: RefState, radius: number) {
  if (!state.current!.context) return

  for (const node of state.current!.nodes) {
    drawNode(state, node, radius)
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

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  context.beginPath()
  context.moveTo(x + r, y)
  context.lineTo(x + w - r, y)
  context.quadraticCurveTo(x + w, y, x + w, y + r)
  context.lineTo(x + w, y + h - r)
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  context.lineTo(x + r, y + h)
  context.quadraticCurveTo(x, y + h, x, y + h - r)
  context.lineTo(x, y + r)
  context.quadraticCurveTo(x, y, x + r, y)
  context.closePath()
}

export function drawLinkTooltip(
  state: RefState,
  pointerX: number,
  pointerY: number,
) {
  if (!state.current?.hoveredData.link) return

  const text = state.current?.linkLabel?.(state.current.hoveredData.link)
  const padX = 6 // horizontal padding
  const padY = 4 // vertical padding
  const fontSize = 12

  state.current.context!.font = `${fontSize}px sans-serif`
  state.current.context!.textBaseline = 'top'
  state.current.context!.textAlign = 'center' // << center text horizontally

  const textWidth = state.current.context!.measureText(text ?? '').width
  const tooltipWidth = textWidth + padX * 2
  const tooltipHeight = fontSize + padY * 2

  const x = pointerX + 4
  const y = pointerY + 4

  // Draw background (rounded rect)
  state.current.context!.fillStyle = 'rgba(0,0,0,0.70)'
  state.current.context!.strokeStyle = 'rgba(0,0,0,0)'
  state.current.context!.lineWidth = 0
  drawRoundedRect(state.current.context!, x, y, tooltipWidth, tooltipHeight, 6)
  state.current.context!.fill()

  // Draw text centered inside
  state.current.context!.fillStyle = 'white'
  state.current.context!.fillText(
    text ?? '',
    x + tooltipWidth / 2, // centered horizontally
    y + padY, // top padding
  )
  state.current.context!.stroke()
}

export function drawLasso(state: RefState) {
  const lassoPath = state.current?.lassoPath
  if (lassoPath && lassoPath?.length > 0) {
    state.current!.context!.beginPath()
    state.current!.context!.moveTo(lassoPath[0][0], lassoPath[0][1])
    for (let i = 1; i < lassoPath.length; i++) {
      state.current!.context!.lineTo(lassoPath[i][0], lassoPath[i][1])
    }
    state.current!.context!.setLineDash([4, 8])
    state.current!.context!.closePath()
    state.current!.context!.lineWidth = 1
    state.current!.context!.fillStyle = 'rgba(0,0,0,.1)'
    state.current!.context!.fill('evenodd')
    state.current!.context!.strokeStyle = '#363740'
    state.current!.context!.stroke()
    state.current!.context!.setLineDash([])
  }
}
