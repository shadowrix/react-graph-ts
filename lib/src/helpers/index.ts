import { computeControlPoint } from '../features/handlers'
import { LinkType, NodeType } from '../typings'

export function buildLinkGrid(links: LinkType[]) {
  //link cellSize = link length * 0.6
  const cellSize = 150
  const grid = new Map<string, LinkType[]>()

  function key(cx: number, cy: number) {
    return `${cx},${cy}`
  }

  for (const link of links) {
    const source = link.source as unknown as NodeType
    const target = link.target as unknown as NodeType

    if (source.x && source.y && target.x && target.y) {
      // 1. Compute control point (your existing function)
      const control = computeControlPoint(source, target, link.curveIndex ?? 1)

      // 2. Compute bezier bounding box
      const bb = quadraticBezierBBox(
        source.x,
        source.y,
        control.x,
        control.y,
        target.x,
        target.y,
      )

      const startX = Math.floor(bb.minX / cellSize)
      const endX = Math.floor(bb.maxX / cellSize)
      const startY = Math.floor(bb.minY / cellSize)
      const endY = Math.floor(bb.maxY / cellSize)

      for (let cx = startX; cx <= endX; cx++) {
        for (let cy = startY; cy <= endY; cy++) {
          const k = key(cx, cy)
          if (!grid.has(k)) grid.set(k, [])
          grid.get(k)!.push(link)
        }
      }
    }
  }

  return grid
}

function quadraticBezierBBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  function extrema(p0: number, p1: number, p2: number) {
    const denom = p0 - 2 * p1 + p2
    if (denom === 0) return [] // no interior extrema
    const t = (p0 - p1) / denom
    return t > 0 && t < 1 ? [t] : []
  }

  const ts = [...extrema(x0, x1, x2), ...extrema(y0, y1, y2), 0, 1]

  let minX = Infinity,
    minY = Infinity
  let maxX = -Infinity,
    maxY = -Infinity

  for (const t of ts) {
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * x1 + t * t * x2
    const y = mt * mt * y0 + 2 * mt * t * y1 + t * t * y2

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  return { minX, minY, maxX, maxY }
}

export function assignDirectionalCurves(links: LinkType[]) {
  const groups = new Map<string, LinkType[]>()

  const copiedLinks = JSON.parse(JSON.stringify(links))

  for (const link of copiedLinks) {
    // Keep direction: (A->B !== B->A)
    const key = `${String(link.source)}->${String(link.target)}`

    let group = groups.get(key)
    if (!group) {
      group = []
      groups.set(key, group)
    }
    group.push(link)
  }

  // Assign curve indexes per group
  for (const group of groups.values()) {
    const n = group.length
    const centerOffset = (n - 1) / 2 // allows symmetric spacing

    for (let i = 0; i < n; i++) {
      const link = group[i]
      link.curveIndex = i - centerOffset
      link.curveGroupSize = n
    }
  }

  return copiedLinks as LinkType[]
}
