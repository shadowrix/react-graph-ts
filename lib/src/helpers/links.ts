import { NodeType } from '../typings'

export function computeControlPoint(
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
