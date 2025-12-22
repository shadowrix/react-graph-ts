import React from 'react'

import { select } from 'd3-selection'

import { RefState } from '../state'
import { ClickedButton, LinkType } from '../typings'
import { cubicBezierBBox } from '../helpers'

export type UseHandlersParameters = {
  state: RefState
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useHandlers({
  state,
  getPointerCoords,
}: UseHandlersParameters) {
  function findHoveredNode(gx: number, gy: number, radius: number) {
    return state.current!.nodesCache?.find(gx, gy, radius) || null
  }

  /** HANDLE HOVER */
  React.useEffect(() => {
    const canvas = state.current!.canvas!

    function handleMove(event: PointerEvent) {
      if (state.current!.isDragging) return

      const [x, y] = getPointerCoords(event.clientX, event.clientY)

      const hoveredNode = findHoveredNode(
        x,
        y,
        state.current!.settings.nodeRadius,
      )

      let hoveredLink: LinkType | null = null

      if (!hoveredNode) {
        const cellSize = 150

        const cx = Math.floor(x / cellSize)
        const cy = Math.floor(y / cellSize)

        const key = `${cx},${cy}`
        const candidates = state.current!.linksGrid.get(key)
        if (candidates) {
          const sortedCandidates = candidates
            .slice()
            .sort((a, b) => (b.drawIndex ?? 0) - (a.drawIndex ?? 0))

          for (let i = sortedCandidates.length - 1; i >= 0; i--) {
            const link = sortedCandidates[i]

            if (!link._viewSettings?.start || !link._viewSettings?.end) return
            const cp = link.control!
            const cp2 = link.control2!

            const hoverPx = 2 // screen pixels tolerance (how 'thick' hover area is)
            if (link._viewSettings.isSelf) {
              if (
                hitTestCubic(
                  x,
                  y,
                  link._viewSettings.start.x,
                  link._viewSettings.start.y,
                  cp.x,
                  cp.y,
                  cp2.x,
                  cp2.y,
                  link._viewSettings.end.x!,
                  link._viewSettings.end.y!,
                  hoverPx,
                )
              ) {
                hoveredLink = link
                break
              }
            } else {
              if (
                hitTestQuadratic(
                  x,
                  y,
                  link._viewSettings.start.x,
                  link._viewSettings.start.y,
                  cp.x,
                  cp.y,
                  link._viewSettings.end.x!,
                  link._viewSettings.end.y!,
                  hoverPx,
                )
              ) {
                hoveredLink = link
                break
              }
            }
          }

          if (
            !state.current!.hoveredData.node &&
            !state.current!.hoveredData.link &&
            !hoveredLink
          )
            return
        }
      }

      if (
        (hoveredNode?.id &&
          state.current!.hoveredData.node?.id === hoveredNode?.id) ||
        (hoveredLink?.id &&
          state.current!.hoveredData.link?.id === hoveredLink?.id)
      )
        return

      state.current!.hoveredData.link = hoveredLink
      state.current!.hoveredData.node = hoveredNode
      state.current!.hoveredData.pointer = { x, y }
    }

    canvas.addEventListener('pointermove', handleMove)

    return () => canvas?.removeEventListener?.('pointermove', handleMove)
  }, [])

  /** HANDLE CLICKS */
  React.useEffect(() => {
    const canvas = select(state.current!.canvas!)

    canvas.on('contextmenu', (event) => {
      event.preventDefault()
    })
    canvas.on('pointerup', (event: MouseEvent) => {
      const { button, ctrlKey } = event

      if (state.current!.isDragging) return

      function handleTarget(type: ClickedButton) {
        if (state.current!.hoveredData.link)
          return state.current?.onClick?.(
            state.current!.hoveredData.link,
            'link',
            type,
            event,
          )
        if (state.current!.hoveredData.node)
          return state.current?.onClick?.(
            state.current!.hoveredData.node,
            'node',
            type,
            event,
          )

        const [x, y] = getPointerCoords(event.clientX, event.clientY)

        const clickedNode = findHoveredNode(
          x,
          y,
          state.current!.settings.nodeRadius,
        )

        if (clickedNode)
          return state.current?.onClick?.(clickedNode, 'node', type, event)

        const clickedLink = findLink(state, x, y)

        if (clickedLink)
          return state.current?.onClick?.(clickedLink, 'link', type, event)

        return state.current?.onClick?.(null, 'background', type, event)
      }

      switch (true) {
        case button === 0 && ctrlKey:
          return handleTarget('ctrl-left')
        case button === 0:
          return handleTarget('left')
        case button === 2 && ctrlKey:
          return handleTarget('ctrl-right')
        case button === 2:
          return handleTarget('right')
      }
    })
    return () => {
      canvas?.on?.('mouseup', null)
      canvas?.on?.('contextmenu', null)
    }
  }, [])
}

// conservative bezier bbox (control + endpoints)
function bezierBBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return {
    minX: Math.min(x0, x1, x2),
    minY: Math.min(y0, y1, y2),
    maxX: Math.max(x0, x1, x2),
    maxY: Math.max(y0, y1, y2),
  }
}

// dense sampling hit-test for quadratic bezier
function hitTestQuadratic(
  px: number,
  py: number,
  x0: number,
  y0: number,
  xc: number,
  yc: number,
  x2: number,
  y2: number,
  tol: number,
) {
  // quick bbox test with tolerance
  const bb = bezierBBox(x0, y0, xc, yc, x2, y2)
  if (
    px < bb.minX - tol ||
    px > bb.maxX + tol ||
    py < bb.minY - tol ||
    py > bb.maxY + tol
  )
    return false

  const chord = Math.hypot(x2 - x0, y2 - y0)
  const contLen = Math.hypot(xc - x0, yc - y0) + Math.hypot(x2 - xc, y2 - yc)
  const approxLen = (chord + contLen) / 2
  const steps = Math.max(16, Math.ceil(approxLen / 1))

  const tol2 = tol * tol
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * xc + t * t * x2
    const y = mt * mt * y0 + 2 * mt * t * yc + t * t * y2
    const dx = px - x,
      dy = py - y
    if (dx * dx + dy * dy <= tol2) return true
  }
  return false
}

function hitTestCubic(
  px: number,
  py: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tol: number,
) {
  // --- 1. Quick bbox reject (with tolerance)
  const bb = cubicBezierBBox(x0, y0, x1, y1, x2, y2, x3, y3)

  if (
    px < bb.minX - tol ||
    px > bb.maxX + tol ||
    py < bb.minY - tol ||
    py > bb.maxY + tol
  ) {
    return false
  }

  // --- 2. Approximate curve length (control polygon)
  const chord = Math.hypot(x3 - x0, y3 - y0)
  const contLen =
    Math.hypot(x1 - x0, y1 - y0) +
    Math.hypot(x2 - x1, y2 - y1) +
    Math.hypot(x3 - x2, y3 - y2)

  const approxLen = (chord + contLen) / 2

  // --- 3. Adaptive sampling
  const steps = Math.max(24, Math.ceil(approxLen / 1))

  const tol2 = tol * tol

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
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

    const dx = px - x
    const dy = py - y

    if (dx * dx + dy * dy <= tol2) {
      return true
    }
  }

  return false
}

function findLink(state: RefState, pointerX: number, pointerY: number) {
  const cellSize = 150

  const cx = Math.floor(pointerX / cellSize)
  const cy = Math.floor(pointerY / cellSize)

  const key = `${cx},${cy}`
  const candidates = state.current!.linksGrid.get(key)
  if (!candidates) return null

  const sortedCandidates = candidates
    .slice()
    .sort((a, b) => (b.drawIndex ?? 0) - (a.drawIndex ?? 0))

  for (let i = sortedCandidates.length - 1; i >= 0; i--) {
    const link = sortedCandidates[i]

    if (!link._viewSettings?.start || !link._viewSettings?.end) return
    const cp = link.control!
    // tolerance in graph (no zoom here) is hoverPx
    const hoverPx = 2 // screen pixels tolerance (how 'thick' hover area is)
    if (
      hitTestQuadratic(
        pointerX,
        pointerY,
        link._viewSettings.start.x,
        link._viewSettings.start.y,
        cp.x,
        cp.y,
        link._viewSettings.end.x,
        link._viewSettings.end.y,
        hoverPx,
      )
    ) {
      return link
    }
  }
  return null
}
