import { RefState } from '../state'
import { computeControlPoint } from '../helpers'
import { LinkType, NodeType } from '../typings'

function drawArrow(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size = 14,
  inset = 0.36,
  color = '#222',
) {
  const length = size
  const height = size / 2

  inset = Math.max(0, Math.min(0.9, inset))

  const backX = -Math.abs(length)
  const halfH = Math.abs(height) / 2

  const controlX = backX * (1 - inset) // when inset=0.36 ~ 0.64*backX
  const controlY = 0

  context.save()
  context.translate(x, y)
  context.rotate(angle)

  context.beginPath()
  context.moveTo(backX, -halfH)
  context.lineTo(0, 0)
  context.lineTo(backX, halfH)
  context.quadraticCurveTo(controlX, controlY, backX, -halfH)
  context.closePath()

  context.fillStyle = color
  context.fill()

  context.restore()
}

function bezierTangent(
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number,
  t: number,
) {
  return {
    x: 2 * (1 - t) * (controlX - sourceX) + 2 * t * (targetX - controlX),
    y: 2 * (1 - t) * (controlY - sourceY) + 2 * t * (targetY - controlY),
  }
}

function normalize(vector: { x: number; y: number }) {
  const l = Math.hypot(vector.x, vector.y)
  return { x: vector.x / l, y: vector.y / l }
}

function updateViewCoords(
  link: LinkType,
  source: NodeType,
  target: NodeType,
  nodeRadius: number,
) {
  if (!source?.x || !target?.x || !source?.y || !target?.y) return

  const sx = source.x,
    sy = source.y,
    tx = target.x,
    ty = target.y

  link.control = computeControlPoint(source, target, link.curveIndex ?? 0)

  const tStart = normalize(
    bezierTangent(sx, sy, link.control.x, link.control.y, tx, ty, 0),
  )
  const tEnd = normalize(
    bezierTangent(sx, sy, link.control.x, link.control.y, tx, ty, 1),
  )

  const start = {
    x: sx + tStart.x * nodeRadius,
    y: sy + tStart.y * nodeRadius,
  }
  const end = {
    x: tx - tEnd.x * nodeRadius,
    y: ty - tEnd.y * nodeRadius,
  }

  if (!link._viewSettings) {
    link._viewSettings = {}
  }

  link._viewSettings.tStart = tStart
  link._viewSettings.tEnd = tEnd
  link._viewSettings.start = start
  link._viewSettings.end = end
}

//TODO: Add all settings for links and mb custom links
export function drawLink(state: RefState, link: LinkType) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  const isHovered =
    state.current!.hoveredData.link?.id === link.id ||
    state.current!.hoveredData.node?.id === source.id ||
    state.current!.hoveredData.node?.id === target.id

  const isDashed = link.settings?.isDashed ?? state.current!.settings.isDashed
  const withParticles =
    link.settings?.withParticles ?? state.current!.settings.withParticles
  const color =
    state.current!.linkColor?.(link, isHovered) ??
    link.settings?.color ??
    state.current!.colors.link

  const withArrow =
    link.settings?.withArrow ?? state.current?.settings.withLinksArrows

  const width = link.settings?.width ?? 1

  if (
    !source?.x ||
    !target?.x ||
    !source?.y ||
    !target?.y ||
    !state.current!.context
  )
    return

  //TODO: Mb execute only when positions has been changed of nodes or links
  updateViewCoords(link, source, target, state.current!.settings.nodeRadius)

  if (
    !link?._viewSettings?.start ||
    !link.control ||
    !link?._viewSettings?.end ||
    !link._viewSettings.tEnd
  )
    return

  state.current!.context.beginPath()
  state.current!.context.moveTo(
    link._viewSettings.start.x,
    link._viewSettings.start.y,
  )
  state.current!.context.quadraticCurveTo(
    link.control.x,
    link.control.y,
    link._viewSettings.end.x,
    link._viewSettings.end.y,
  )

  state.current!.context!.setLineDash([])
  if (isDashed) {
    state.current!.context!.setLineDash([10, 5])
  }
  state.current!.context!.strokeStyle = color
  state.current!.context!.lineWidth = width
  if (isHovered) {
    state.current!.context!.lineWidth = 2
    state.current!.context!.strokeStyle = color
  }

  state.current!.context.stroke()

  if (withArrow) {
    const angle = Math.atan2(
      link._viewSettings.tEnd.y,
      link._viewSettings.tEnd.x,
    )
    drawArrow(
      state.current!.context,
      link._viewSettings.end.x,
      link._viewSettings.end.y,
      angle,
      14,
      0.36,
      state.current!.colors.arrow ?? color,
    )
  }

  if (isHovered) {
    if (withParticles) {
      drawCurvedLinkParticle(state, link, link.control.x, link.control.y)
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
export function drawNode(state: RefState, node: NodeType) {
  function draw() {
    const x = node.x
    const y = node.y
    const context = state.current?.context

    if (!context || !x || !y) return
    const radius = state.current!.settings.nodeRadius

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

    const label = state.current!.nodeLabel?.(node)
    if (state.current!.transform.k < 0.6 || !label) return

    if (!state.current!.settings.withNodeLabels) return
    // label
    context.font = '12px sans-serif'
    context.fillStyle = state.current!.colors.nodeLabel
    context.textBaseline = 'bottom'
    context.textAlign = 'center'
    context.fillText(label, x, y - radius - 6)
  }

  if (state.current?.drawNode) {
    state.current?.drawNode(state.current!.context!, node, draw)
    return
  }

  draw()
}

export function drawAllNodes(state: RefState) {
  if (!state.current!.context) return

  for (const node of state.current!.nodes) {
    drawNode(state, node)
  }
}

function drawCurvedLinkParticle(
  state: RefState,
  link: LinkType,
  controlX: number,
  controlY: number,
) {
  if (!link._viewSettings?.start || !link._viewSettings.end) return

  const p = getPointOnQuadraticCurve(
    link._viewSettings.start.x,
    link._viewSettings.start.y,
    controlX,
    controlY,
    link._viewSettings.end.x,
    link._viewSettings.end.y,
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
