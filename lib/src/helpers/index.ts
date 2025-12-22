import { select } from 'd3-selection'
import { zoomIdentity, ZoomTransform } from 'd3-zoom'

import {
  computeQuadraticControlPoint,
  computeCubicControlCoords,
} from './links'
import { RefState } from '../state'
import { LinkType, NodeType } from '../typings'

export { computeQuadraticControlPoint, computeCubicControlCoords }

export function buildLinkGrid(links: LinkType[], radius: number) {
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
      if (!link.control) {
        link.control = computeQuadraticControlPoint(
          source,
          target,
          link._viewSettings?.curveIndex ?? 1,
        )
      }

      // 2. Compute bezier bounding box
      let bb: {
        minX: number
        minY: number
        maxX: number
        maxY: number
      } = {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
      }
      if (link._viewSettings?.isSelf) {
        if (!link.control2) {
          const { start, control, control2, end } = computeCubicControlCoords(
            source.x,
            source.y,
            radius,
            link._viewSettings?.curveIndex!,
            link._viewSettings?.curveGroupSize!,
          )
          if (!link._viewSettings) link._viewSettings = {}

          link._viewSettings.start = start
          link.control = control
          link.control2 = control2
          link._viewSettings.end = end
        }

        bb = cubicBezierBBox(
          source.x,
          source.y,
          link.control.x,
          link.control.y,
          link.control2.x,
          link.control2.y,
          target.x,
          target.y,
        )
      } else {
        bb = quadraticBezierBBox(
          source.x,
          source.y,
          link.control.x,
          link.control.y,
          target.x,
          target.y,
        )
      }

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

export function cubicBezierBBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) {
  function extrema(p0: number, p1: number, p2: number, p3: number) {
    const a = -p0 + 3 * p1 - 3 * p2 + p3
    const b = 2 * (p0 - 2 * p1 + p2)
    const c = -p0 + p1

    const ts: number[] = []

    if (Math.abs(a) < 1e-8) {
      if (Math.abs(b) < 1e-8) return ts
      const t = -c / b
      if (t > 0 && t < 1) ts.push(t)
      return ts
    }

    const disc = b * b - 4 * a * c
    if (disc < 0) return ts

    const s = Math.sqrt(disc)
    const t1 = (-b + s) / (2 * a)
    const t2 = (-b - s) / (2 * a)

    if (t1 > 0 && t1 < 1) ts.push(t1)
    if (t2 > 0 && t2 < 1) ts.push(t2)

    return ts
  }

  const ts = [0, 1, ...extrema(x0, x1, x2, x3), ...extrema(y0, y1, y2, y3)]

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (const t of ts) {
    const mt = 1 - t
    const x =
      mt * mt * mt * x0 +
      3 * mt * mt * t * x1 +
      3 * mt * t * t * x2 +
      t * t * t * x3

    const y =
      mt * mt * mt * y0 +
      3 * mt * mt * t * y1 +
      3 * mt * t * t * y2 +
      t * t * t * y3

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  return { minX, minY, maxX, maxY }
}

export function assignCurves(links: LinkType[]): LinkType[] {
  const groups = new Map<string, LinkType[]>()
  const selfGroups = new Map<string, LinkType[]>()

  for (const link of links) {
    const sourceId =
      typeof link.source === 'string' ? link.source : link.source.id
    const targetId =
      typeof link.target === 'string' ? link.target : link.target.id

    if (sourceId === targetId) {
      const key = JSON.stringify([sourceId])
      const group = selfGroups.get(key)
      if (group) {
        group.push(link)
        continue
      }
      selfGroups.set(key, [link])
      continue
    }

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
      if (!link._viewSettings) link._viewSettings = {}
      link._viewSettings.curveIndex = i + 1 - center // -1, 0, +1, ...
      link._viewSettings.curveGroupSize = n
    }
  }
  for (const group of selfGroups.values()) {
    for (let i = 0; i < group.length; i++) {
      const link = group[i]
      if (!link._viewSettings) link._viewSettings = {}
      link._viewSettings.isSelf = true
      link._viewSettings.curveIndex = i + 1
      link._viewSettings.curveGroupSize = group.length
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

export function centerAt(
  state: RefState,
  x: number,
  y: number,
  transform?: number,
  duration = 0,
) {
  const t = transform ?? state.current!.transform.k
  const width = state.current!.canvas!.width
  const height = state.current!.canvas!.height

  const newTransform = zoomIdentity
    .translate(width / 2 - t * x, height / 2 - t * y)
    .scale(t)

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
