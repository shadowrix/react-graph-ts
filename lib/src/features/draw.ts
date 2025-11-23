import { RefState } from '../state'
import { HoveredData, LinkType, NodeType } from '../typings'

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

  const mx = (source.x! + target.x!) / 2
  const my = (source.y! + target.y!) / 2
  const dx = target.x! - source.x!
  const dy = target.y! - source.y!
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  const cx = mx + nx
  const cy = my + ny

  state.current.context.beginPath()
  state.current.context.lineWidth = 2
  state.current.context.strokeStyle = '#666'
  if (state.current.hoveredData.link?.id === link.id) {
    state.current.context.lineWidth = 4
    state.current.context.strokeStyle = '#1682caff'
  }
  state.current.context.moveTo(source.x, source.y)
  state.current.context.quadraticCurveTo(cx, cy, target.x, target.y)
  state.current.context.stroke()
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
  context.fillStyle = '#4a90e2'
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (state.current.hoveredData.node?.id === node.id) {
    context.fillStyle = '#cb1daeff'
    context.arc(x, y, radius * 2, 0, Math.PI * 2)
  }
  context.fill()
  context.strokeStyle = '#1b365d'
  context.lineWidth = 1
  context.stroke()

  // label
  context.font = '12px sans-serif'
  context.fillStyle = '#111'
  context.textBaseline = 'middle'
  context.fillText(String(node.id), x + radius + 6, y)
}

export function drawAllNodes(state: RefState, radius: number) {
  if (!state.current.context) return

  for (const node of state.current.nodes) {
    drawNode(state, node, radius)
  }
}
