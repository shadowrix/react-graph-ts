import { HoveredData, LinkType, NodeType } from '../typings'

//TODO: Add all settings for links and mb custom links
export function drawLink(
  context: CanvasRenderingContext2D,
  hoveredData: React.RefObject<HoveredData>,
  link: LinkType,
) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType
  if (!source?.x || !target?.x || !source?.y || !target?.y) return

  const mx = (source.x! + target.x!) / 2
  const my = (source.y! + target.y!) / 2
  const dx = target.x! - source.x!
  const dy = target.y! - source.y!
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  const cx = mx + nx
  const cy = my + ny

  context.beginPath()
  context.lineWidth = 2
  context.strokeStyle = '#666'
  if (hoveredData.current.link?.id === link.id) {
    context.lineWidth = 4
    context.strokeStyle = '#1682caff'
  }
  context.moveTo(source.x, source.y)
  context.quadraticCurveTo(cx, cy, target.x, target.y)
  context.stroke()
}

export function drawAllLinks(
  context: CanvasRenderingContext2D,
  hoveredData: React.RefObject<HoveredData>,
  links: LinkType[],
) {
  for (let index = 0; index < links.length; index++) {
    const link = links[index]

    drawLink(context, hoveredData, link)

    link.drawIndex = index
  }
}

//TODO: Add all settings for node and custom nodes
export function drawNode(
  context: CanvasRenderingContext2D,
  hoveredData: React.RefObject<HoveredData>,
  node: NodeType,
  radius: number,
) {
  const x = node.x!
  const y = node.y!

  context.beginPath()
  context.fillStyle = '#4a90e2'
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (hoveredData.current.node?.id === node.id) {
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

export function drawAllNodes(
  context: CanvasRenderingContext2D,
  hoveredData: React.RefObject<HoveredData>,
  nodes: NodeType[],
  radius: number,
) {
  for (const node of nodes) {
    drawNode(context, hoveredData, node, radius)
  }
}
