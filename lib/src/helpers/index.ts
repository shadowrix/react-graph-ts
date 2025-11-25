import { computeControlPoint } from '../features/handlers'
import { LinkType, NodeType } from '../typings'

export function buildLinkGrid(links: LinkType[]) {
  const cellSize = 150
  const grid = new Map<string, LinkType[]>()

  function key(cx: number, cy: number) {
    return `${cx},${cy}`
  }

  // function computeSampleCount(x0, y0, xc, yc, x2, y2) {
  //   const chord = Math.hypot(x2 - x0, y2 - y0)
  //   return Math.min(12, Math.max(6, Math.ceil(chord / 80)))
  // }

  function bezierPoint(
    x0: number,
    y0: number,
    xc: number,
    yc: number,
    x2: number,
    y2: number,
    t: number,
  ) {
    const mt = 1 - t
    return {
      x: mt * mt * x0 + 2 * mt * t * xc + t * t * x2,
      y: mt * mt * y0 + 2 * mt * t * yc + t * t * y2,
    }
  }

  for (const link of links) {
    const source = link.source as unknown as NodeType
    const target = link.target as unknown as NodeType

    if (source.x && source.y && target.x && target.y) {
      // const minX = Math.min(source.x, target.x)
      // const maxX = Math.max(source.x, target.x)
      // const minY = Math.min(source.y, target.y)
      // const maxY = Math.max(source.y, target.y)
      // 1. Compute control point (your existing function)
      const c = computeControlPoint(source, target, link.curveIndex ?? 1)

      // const steps = computeSampleCount(s.x, s.y, c.x, c.y, t.x, t.y)
      const steps = 8

      for (let i = 0; i <= steps; i++) {
        const tval = i / steps
        const p = bezierPoint(
          source.x,
          source.y,
          c.x,
          c.y,
          target.x,
          target.y,
          tval,
        )
        const cx = Math.floor(p.x / cellSize)
        const cy = Math.floor(p.y / cellSize)

        const k = key(cx, cy)
        if (!grid.has(k)) grid.set(k, [])
        grid.get(k)!.push(link)
      }

      // 2. Compute bezier bounding box
      // const bb = quadraticBezierBBox(
      //   source.x,
      //   source.y,
      //   c.x,
      //   c.y,
      //   target.x,
      //   target.y,
      // )

      // const startX = Math.floor(bb.minX / cellSize)
      // const endX = Math.floor(bb.maxX / cellSize)
      // const startY = Math.floor(bb.minY / cellSize)
      // const endY = Math.floor(bb.maxY / cellSize)

      // for (let cx = startX; cx <= endX; cx++) {
      //   for (let cy = startY; cy <= endY; cy++) {
      //     const k = key(cx, cy)
      //     if (!grid.has(k)) grid.set(k, [])
      //     grid.get(k)!.push(link)
      //   }
      // }
    }
  }

  return grid
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
      link.curveIndex = i - centerOffset // -1, 0, +1 etc
      link.curveGroupSize = n // useful for hover radius
    }
  }

  return copiedLinks as LinkType[]
}
