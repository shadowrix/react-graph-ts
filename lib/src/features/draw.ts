import { RefState } from '../state'
import { LinkType, NodeType } from '../typings'

//TODO: Add all settings for links and mb custom links
export function drawLink(state: RefState, link: LinkType) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  if (
    !source?.x ||
    !target?.x ||
    !source?.y ||
    !target?.y ||
    !state.current.context
  )
    return

  const sx = source.x
  const sy = source.y
  const tx = target.x
  const ty = target.y

  if (link.curveGroupSize === 1) {
    state.current.context.beginPath()
    state.current.context.moveTo(sx, sy)
    state.current.context.lineTo(tx, ty)
    state.current.context.strokeStyle = state.current.colors.link
    state.current.context.lineWidth = 1
    if (state.current.hoveredData.link?.id === link.id) {
      state.current.context.lineWidth = 4
      state.current.context.strokeStyle = state.current.colors.linkHover
    }
    state.current.context.stroke()
    return
  }

  const mx = (sx + tx) * 0.5
  const my = (sy + ty) * 0.5

  const dx = tx - sx
  const dy = ty - sy

  // fast inverse length
  const invLen = 1 / Math.sqrt(dx * dx + dy * dy)

  const nx = -dy * invLen
  const ny = dx * invLen

  // curve offset based on multi-edge index
  const baseOffset = 0.08
  const evenNumber = (link.curveIndex ?? 1) % 2 === 0 ? 1 : -1
  const offset = evenNumber * (link.curveIndex ?? 1) * baseOffset

  const cpx = mx + nx * offset
  const cpy = my + ny * offset

  state.current.context.beginPath()
  state.current.context.moveTo(sx, sy)
  state.current.context.quadraticCurveTo(cpx, cpy, tx, ty)

  state.current.context.lineWidth = 1
  state.current.context.strokeStyle = state.current.colors.link
  if (state.current.hoveredData.link?.id === link.id) {
    state.current.context.lineWidth = 4
    state.current.context.strokeStyle = state.current.colors.linkHover
  }
  state.current.context.stroke()
  // const source = link.source as unknown as NodeType
  // const target = link.target as unknown as NodeType
  // if (
  //   !source?.x ||
  //   !target?.x ||
  //   !source?.y ||
  //   !target?.y ||
  //   !state.current.context
  // )
  //   return

  // const mx = (source.x! + target.x!) / 2
  // const my = (source.y! + target.y!) / 2
  // const dx = target.x! - source.x!
  // const dy = target.y! - source.y!
  // const length = Math.hypot(dx, dy) || 1
  // const nx = -dy / length
  // const ny = dx / length
  // const cx = mx + nx
  // const cy = my + ny

  // state.current.context.beginPath()
  // state.current.context.lineWidth = 1
  // state.current.context.strokeStyle = state.current.colors.link
  // if (state.current.hoveredData.link?.id === link.id) {
  //   state.current.context.lineWidth = 4
  //   state.current.context.strokeStyle = state.current.colors.linkHover
  // }
  // state.current.context.moveTo(source.x, source.y)
  // state.current.context.quadraticCurveTo(cx, cy, target.x, target.y)
  // state.current.context.stroke()
}

export function drawAllLinks(state: RefState) {
  for (let index = 0; index < state.current.links.length; index++) {
    const link = state.current.links[index]

    drawLink(state, link)

    link.drawIndex = index
  }
}

//TODO: Add all settings for node and custom nodes
export function drawNode(state: RefState, node: NodeType, radius: number) {
  const x = node.x!
  const y = node.y!
  const context = state.current.context!

  context.beginPath()
  context.fillStyle = state.current.colors.node
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (state.current.hoveredData.node?.id === node.id) {
    context.fillStyle = state.current.colors.nodeHover
    context.arc(x, y, radius * 2, 0, Math.PI * 2)
  }
  context.fill()
  // context.strokeStyle = state.current.colors.node
  // context.lineWidth = 1
  // context.stroke()

  // label
  context.font = '12px sans-serif'
  context.fillStyle = state.current.colors.nodeLabel
  context.textBaseline = 'middle'
  context.fillText(String(node.id), x + radius + 6, y)
}

export function drawAllNodes(state: RefState, radius: number) {
  if (!state.current.context) return

  for (const node of state.current.nodes) {
    drawNode(state, node, radius)
  }
}
