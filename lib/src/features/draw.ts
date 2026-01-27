import { computeQuadraticControlPoint } from '../helpers'
import { LinkType, NodeType } from '../typings'
import { computeCubicControlCoords } from '../helpers'
import { State } from '../typings/state'
import { INITIAL_STATE } from '../state'

function drawSelfLink(
  context: CanvasRenderingContext2D,
  link: LinkType,
  nodeX: number,
  nodeY: number,
  withArrow: boolean | undefined,
  radius: number,
  color: string,
  width: number,
  isHovered: boolean,
  arrowSize: number,
) {
  const { start, control, control2, end } = computeCubicControlCoords(
    nodeX,
    nodeY,
    radius,
    link._viewSettings?.curveIndex!,
    link._viewSettings?.curveGroupSize!,
  )
  if (!link._viewSettings) link._viewSettings = {}

  link._viewSettings.start = start
  link.control = control
  link.control2 = control2
  link._viewSettings.end = end

  // Curve
  context.beginPath()
  context.strokeStyle = color
  context.lineWidth = width
  if (isHovered) {
    context.lineWidth = width + 1
  }
  context.moveTo(start.x, start.y)
  context.bezierCurveTo(
    control.x,
    control.y,
    control2.x,
    control2.y,
    end.x,
    end.y,
  )
  context.stroke()

  if (withArrow) {
    const dx = end.x - control2.x
    const dy = end.y - control2.y
    const angle = Math.atan2(dy, dx)
    drawArrow(context, end.x, end.y, angle, arrowSize, 0.36, color)
  }
}

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

  link.control = computeQuadraticControlPoint(
    source,
    target,
    link._viewSettings?.curveIndex ?? 0,
  )

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
export function drawLink(state: State, link: LinkType) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  const isHovered =
    state.hoveredData.link?.id === link.id ||
    state.hoveredData.node?.id === source.id ||
    state.hoveredData.node?.id === target.id

  const isDashed =
    link.settings?.isDashed ?? state.externalState.settings.isDashed
  const withParticles =
    link.settings?.withParticles ?? state.externalState.settings.withParticles
  const color =
    state.externalState.handlers.linkColor?.(link, isHovered) ??
    link.settings?.color ??
    state.externalState.colors.link ??
    INITIAL_STATE.externalState.colors.link!

  const nodeRadius =
    state.externalState.settings.nodeRadius ??
    INITIAL_STATE.externalState.settings.nodeRadius!

  const withArrow =
    link.settings?.withArrow ?? state.externalState?.settings.withLinksArrows

  const width =
    link.settings?.width ?? state.externalState?.settings.linkWidth ?? 1

  const arrowSize =
    (state.externalState.settings.arrowSize ?? 14) *
    (width > 2 ? width * 0.5 : 1)

  if (!source?.x || !target?.x || !source?.y || !target?.y || !state.context)
    return

  if (source.id === target.id) {
    if (!link._viewSettings) link._viewSettings = {}
    return drawSelfLink(
      state.context,
      link,
      source.x,
      source.y,
      withArrow,
      nodeRadius,
      color,
      width,
      isHovered,
      arrowSize,
    )
  }

  //TODO: Mb execute only when positions has been changed of nodes or links
  updateViewCoords(link, source, target, nodeRadius)

  if (
    !link?._viewSettings?.start ||
    !link.control ||
    !link?._viewSettings?.end ||
    !link._viewSettings.tEnd
  )
    return

  state.context.beginPath()
  state.context.moveTo(link._viewSettings.start.x, link._viewSettings.start.y)
  state.context.quadraticCurveTo(
    link.control.x,
    link.control.y,
    link._viewSettings.end.x,
    link._viewSettings.end.y,
  )

  state.context!.setLineDash([])
  if (isDashed) {
    state.context!.setLineDash([10, 5])
  }
  state.context!.strokeStyle = color
  state.context!.lineWidth = width
  if (isHovered) {
    state.context!.lineWidth = width + 1
  }

  state.context.stroke()

  if (withArrow) {
    const angle = Math.atan2(
      link._viewSettings.tEnd.y,
      link._viewSettings.tEnd.x,
    )
    drawArrow(
      state.context,
      link._viewSettings.end.x,
      link._viewSettings.end.y,
      angle,
      arrowSize,
      0.36,
      state.externalState.colors.arrow ?? color,
    )
  }

  if (isHovered) {
    if (withParticles) {
      drawCurvedLinkParticle(state, link, link.control.x, link.control.y)
    }
  }
}

export function drawAllLinks(state: State) {
  if (state.hoveredData.link || state.hoveredData.node) {
    const particlesSpeed =
      state.externalState.settings.particlesSpeed ??
      INITIAL_STATE.externalState.settings.particlesSpeed!
    state.particleProgress = state.particleProgress + particlesSpeed

    if (state.particleProgress > 1) {
      state.particleProgress = 0
    }
  } else {
    state.particleProgress = 0
  }
  for (let index = 0; index < state.externalState.links.length; index++) {
    const link = state.externalState.links[index]

    drawLink(state, link)

    link.drawIndex = index
  }
}

//TODO: Add all settings for node and custom nodes
export function drawNode(state: State, node: NodeType) {
  function draw() {
    const x = node.x
    const y = node.y
    const context = state.context

    if (!context || !x || !y) return
    const radius =
      state.externalState.settings.nodeRadius ??
      INITIAL_STATE.externalState.settings.nodeRadius!

    const isHovered =
      state.hoveredData.node?.id === node.id ||
      (state.hoveredData.link?.source as unknown as NodeType)?.id === node.id ||
      (state.hoveredData.link?.target as unknown as NodeType)?.id === node.id

    context.beginPath()
    context.fillStyle = state.externalState.handlers.nodeColor
      ? state.externalState.handlers.nodeColor(node, false)
      : (state.externalState.colors.node ??
        INITIAL_STATE.externalState.colors.node!)
    context.arc(x, y, radius, 0, Math.PI * 2)
    if (isHovered) {
      context.strokeStyle =
        state.externalState!.colors.nodeHover ??
        INITIAL_STATE.externalState.colors.nodeHover!
      context.lineWidth =
        state.externalState!.settings.hoveredBorder ??
        INITIAL_STATE.externalState.settings.hoveredBorder!
      context.stroke()
    }
    context.fill()
    const label = state.externalState.handlers.nodeLabel?.(node)
    if (state.transform.k < 0.6 || !label) return

    if (!state.externalState.settings.withNodeLabels) return
    // label
    context.font = '12px sans-serif'
    context.fillStyle =
      state.externalState.colors.nodeLabel ??
      INITIAL_STATE.externalState.colors.nodeLabel!
    context.textBaseline = 'bottom'
    context.textAlign = 'center'
    context.fillText(label, x, y - radius - 6)
  }

  if (state.externalState.handlers?.drawNode) {
    state.externalState.handlers.drawNode(state.context!, node, draw)
    return
  }

  draw()
}

export function drawAllNodes(state: State) {
  if (!state.context) return
  // console.log('nodes', state.externalState.nodes)
  for (const node of state.externalState.nodes) {
    drawNode(state, node)
  }
}

function drawCurvedLinkParticle(
  state: State,
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
    state.particleProgress,
  )

  state.context!.beginPath()
  state.context!.arc(
    p.x,
    p.y,
    state.externalState.settings.particlesSize ??
      INITIAL_STATE.externalState.settings.particlesSize!,
    0,
    Math.PI * 2,
  )
  state.context!.fillStyle =
    state.externalState.colors.particles ??
    INITIAL_STATE.externalState.colors.particles!
  state.context!.fill()
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
  state: State,
  pointerX: number,
  pointerY: number,
) {
  if (!state.hoveredData.link) return

  const text = state.externalState.handlers?.linkLabel?.(state.hoveredData.link)
  const padX = 6 // horizontal padding
  const padY = 4 // vertical padding
  const fontSize = 12

  state.context!.font = `${fontSize}px sans-serif`
  state.context!.textBaseline = 'top'
  state.context!.textAlign = 'center' // << center text horizontally

  const textWidth = state.context!.measureText(text ?? '').width
  const tooltipWidth = textWidth + padX * 2
  const tooltipHeight = fontSize + padY * 2

  const x = pointerX + 4
  const y = pointerY + 4

  // Draw background (rounded rect)
  state.context!.fillStyle = 'rgba(0,0,0,0.70)'
  state.context!.strokeStyle = 'rgba(0,0,0,0)'
  state.context!.lineWidth = 0
  drawRoundedRect(state.context!, x, y, tooltipWidth, tooltipHeight, 6)
  state.context!.fill()

  // Draw text centered inside
  state.context!.fillStyle = 'white'
  state.context!.fillText(
    text ?? '',
    x + tooltipWidth / 2, // centered horizontally
    y + padY, // top padding
  )
  state.context!.stroke()
}

export function drawLasso(state: State) {
  const lassoPath = state.lassoPath
  if (lassoPath && lassoPath?.length > 0) {
    state.context!.beginPath()
    state.context!.moveTo(lassoPath[0][0], lassoPath[0][1])
    for (let i = 1; i < lassoPath.length; i++) {
      state.context!.lineTo(lassoPath[i][0], lassoPath[i][1])
    }
    state.context!.setLineDash([4, 8])
    state.context!.closePath()
    state.context!.lineWidth = 1
    state.context!.fillStyle = 'rgba(0,0,0,.1)'
    state.context!.fill('evenodd')
    state.context!.strokeStyle = '#363740'
    state.context!.stroke()
    state.context!.setLineDash([])
  }
}
