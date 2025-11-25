import { RefState } from '../state'
import { computeControlPoint } from './handlers'
import { DetectNodeColorFn, GetLabelFn, LinkType, NodeType } from '../typings'

//TODO: Add all settings for links and mb custom links
export function drawLink(state: RefState, link: LinkType) {
  const source = link.source as unknown as NodeType
  const target = link.target as unknown as NodeType

  const isHovered =
    state.current.hoveredData.link?.id === link.id ||
    state.current.hoveredData.node?.id === source.id ||
    state.current.hoveredData.node?.id === target.id

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

  function setLineSettings() {
    if (state.current.settings.isDashed) {
      state.current.context!.setLineDash([10, 5])
    }
    state.current.context!.strokeStyle = state.current.colors.link
    state.current.context!.lineWidth = 1
    if (isHovered) {
      state.current.context!.lineWidth = 2
      state.current.context!.strokeStyle = state.current.colors.linkHover

      //TODO: If particles
      // state.current.context.
      // state.current.context.arc(px, py, 3, 0, Math.PI * 2)
    }
  }

  // if (link.curveGroupSize === 1) {
  //   state.current.context.beginPath()
  //   state.current.context.moveTo(sx, sy)
  //   state.current.context.lineTo(tx, ty)
  //   setLineSettings()
  //   state.current.context.stroke()
  //   return
  // }

  // if (!link.control)
  link.control = computeControlPoint(source, target, link.curveIndex ?? 0)
  const cp = link.control

  state.current.context.beginPath()
  state.current.context.moveTo(sx, sy)
  state.current.context.quadraticCurveTo(cp.x, cp.y, tx, ty)
  setLineSettings()
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
export function drawNode(
  state: RefState,
  node: NodeType,
  radius: number,
  detectNodeColorFn: DetectNodeColorFn,
  getLabel: GetLabelFn,
) {
  const x = node.x!
  const y = node.y!
  const context = state.current.context!

  context.beginPath()
  context.fillStyle = detectNodeColorFn
    ? detectNodeColorFn(node, false)
    : state.current.colors.node
  context.arc(x, y, radius, 0, Math.PI * 2)
  if (state.current.hoveredData.node?.id === node.id) {
    context.fillStyle = detectNodeColorFn
      ? detectNodeColorFn(node, true)
      : state.current.colors.nodeHover
    context.arc(x, y, radius * 2, 0, Math.PI * 2)
  }
  context.fill()
  // context.strokeStyle = state.current.colors.node
  // context.lineWidth = 1
  // context.stroke()

  const label = getLabel(node)
  if (state.current.transform.k < 0.6 || !label) return

  // label
  context.font = '12px sans-serif'
  context.fillStyle = state.current.colors.nodeLabel
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
  if (!state.current.context) return

  for (const node of state.current.nodes) {
    drawNode(state, node, radius, detectNodeColorFn, getLabel)
  }
}
