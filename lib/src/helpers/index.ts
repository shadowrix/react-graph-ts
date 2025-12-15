import { select, zoomIdentity, ZoomTransform } from 'd3'
import { computeControlPoint } from './links'
import { RefState } from '../state'
import { LinkType, NodeType } from '../typings'

export { computeControlPoint }

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

export function assignCurves(links: LinkType[]): LinkType[] {
  const groups = new Map<string, LinkType[]>()

  for (const link of links) {
    const sourceId =
      typeof link.source === 'string' ? link.source : link.source.id
    const targetId =
      typeof link.target === 'string' ? link.target : link.target.id

    const normalized =
      sourceId.localeCompare(targetId) <= 0
        ? [sourceId, targetId]
        : [targetId, sourceId]

    const key = JSON.stringify(normalized)

    const group = groups.get(key)
    if (group) group.push(link)
    else groups.set(key, [link])
  }
  for (const group of groups.values()) {
    const n = group.length
    const center = n - 1

    for (let i = 0; i < n; i++) {
      const link = group[i]
      link.curveIndex = i + 1 - center // -1, 0, +1, ...
      link.curveGroupSize = n
    }
  }

  return links
}

export function zoomToFit(state: RefState) {
  if (!state.current?.nodes?.length) return

  const { width, height } = state.current.canvas!

  // 1. compute graph bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity

  for (const n of state.current!.nodes) {
    if (n.x! < minX) minX = n.x!
    if (n.x! > maxX) maxX = n.x!
    if (n.y! < minY) minY = n.y!
    if (n.y! > maxY) maxY = n.y!
  }

  const graphWidth = maxX - minX
  const graphHeight = maxY - minY

  // 2. compute scale
  const padding = 100
  const scale = Math.min(
    width / (graphWidth + padding),
    height / (graphHeight + padding),
  )

  // 3. compute center
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  // 4. create transform
  const nextTransform = zoomIdentity
    .translate(width / 2 - cx * scale, height / 2 - cy * scale)
    .scale(scale)

  // 5. apply with animation
  select(state.current!.canvas!)
    .transition()
    .duration(450)
    .call(state.current!.zoomBehavior!.transform!, nextTransform)
}

function animateTo(state: RefState, transform: ZoomTransform, duration = 0) {
  const selection = select(state.current!.canvas)

  if (duration === 0) {
    selection.call(state.current!.zoomBehavior!.transform! as any, transform)
  } else {
    selection
      .transition()
      .duration(duration)
      .call(state.current!.zoomBehavior!.transform! as any, transform)
  }
}

export function centerAt(state: RefState, x: number, y: number, duration = 0) {
  const t = state.current!.transform
  const width = state.current!.canvas!.width
  const height = state.current!.canvas!.height

  const newTransform = zoomIdentity
    .translate(width / 2 - t.k * x, height / 2 - t.k * y)
    .scale(t.k)

  animateTo(state, newTransform, duration)
}

export function zoom(state: RefState, scale: number, duration = 0) {
  const t = state.current!.transform
  const width = state.current!.canvas!.width
  const height = state.current!.canvas!.height

  const newTransform = zoomIdentity
    .translate(
      width / 2 - scale * ((width / 2 - t.x) / t.k),
      height / 2 - scale * ((height / 2 - t.y) / t.k),
    )
    .scale(scale)

  animateTo(state, newTransform, duration)
}
