import { NodeType } from '../typings'

/** For quadratic bezier curve */
export function computeQuadraticControlPoint(
  source: NodeType,
  target: NodeType,
  curveIndex: number,
) {
  const baseOffsetFraction = 0.12 // fraction of link length, try 0.06..0.12
  const treatAsFraction = true
  const sx = source.x!,
    sy = source.y!,
    tx = target.x!,
    ty = target.y!
  const mx = (sx + tx) * 0.5
  const my = (sy + ty) * 0.5
  const dx = tx - sx,
    dy = ty - sy
  const len = Math.hypot(dx, dy) || 1
  const invLen = 1 / len
  const nx = -dy * invLen
  const ny = dx * invLen

  const sign = curveIndex % 2 === 0 ? 1 : -1
  const multiplier = curveIndex * Math.sign(curveIndex)
  const numericOffset = treatAsFraction
    ? baseOffsetFraction * len * multiplier
    : baseOffsetFraction * multiplier

  return {
    x: mx + nx * numericOffset * sign,
    y: my + ny * numericOffset * sign,
  }
}

function pointOnCircle(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  }
}

export function computeCubicControlCoords(
  nodeX: number,
  nodeY: number,
  radius: number,
  index: number,
  total: number,
) {
  const spread = Math.PI / 1.5
  const baseAngle = -Math.PI / 3 // top
  const offset = index * 0.2

  const a1 = baseAngle - spread / 2 - offset
  const a2 = baseAngle - spread / 2 + offset

  const start = pointOnCircle(nodeX, nodeY, radius, a1)
  const end = pointOnCircle(nodeX, nodeY, radius, a2)

  const outer = radius * 10
  const inner = radius * 20
  const t = total > 1 ? index / (total - 1) : 0
  const loopRadius = outer + (inner - outer) * t

  const control = pointOnCircle(nodeX, nodeY, loopRadius, a1)
  const control2 = pointOnCircle(nodeX, nodeY, loopRadius, a2)

  return {
    start,
    control,
    control2,
    end,
  }
}
