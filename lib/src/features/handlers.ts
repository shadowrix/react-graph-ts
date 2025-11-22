import React from 'react'

import { HoveredData, LinkType, NodeType } from '../typings'
import { Quadtree } from 'd3'

export type UseHandlersParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  nodeRadius: number
  nodesCacheRef: React.RefObject<Quadtree<NodeType> | null>
  hoveredData: React.RefObject<HoveredData>
  linksGridRef: React.RefObject<Map<string, LinkType[]>>
  isDraggingRef: React.RefObject<boolean>
  draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useHandlers({
  canvasRef,
  nodeRadius,
  hoveredData,
  linksGridRef,
  isDraggingRef,
  nodesCacheRef,
  draw,
  getPointerCoords,
}: UseHandlersParameters) {
  React.useEffect(() => {
    function findHoveredNode(gx: number, gy: number, radius: number) {
      return nodesCacheRef.current?.find(gx, gy, radius) || null
    }
    const canvas = canvasRef.current!

    function handleMove(event: PointerEvent) {
      if (isDraggingRef.current) return

      const [x, y] = getPointerCoords(event.clientX, event.clientY)

      const hoveredNode = findHoveredNode(x, y, nodeRadius)

      let hoveredLink: LinkType | null = null

      if (!hoveredNode) {
        hoveredLink = findLink(x, y, linksGridRef.current)

        if (
          !hoveredData.current.node &&
          !hoveredData.current.link &&
          !hoveredLink
        )
          return
      }

      if (
        (hoveredNode?.id && hoveredData.current.node?.id === hoveredNode?.id) ||
        (hoveredLink?.id && hoveredData.current.link?.id === hoveredLink?.id)
      )
        return

      hoveredData.current.link = hoveredLink
      hoveredData.current.node = hoveredNode

      draw()
    }

    canvas.addEventListener('pointermove', handleMove)

    return () => canvas.removeEventListener('pointermove', handleMove)
  }, [draw])
}

function pointNearLine(px: number, py: number, link: LinkType, maxDist = 2) {
  const { x: x1, y: y1 } = link.source as unknown as Required<NodeType>
  const { x: x2, y: y2 } = link.target as unknown as Required<NodeType>

  const L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2
  if (L2 === 0) return false

  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2
  t = Math.max(0, Math.min(1, t))

  const projX = x1 + t * (x2 - x1)
  const projY = y1 + t * (y2 - y1)

  return Math.hypot(px - projX, py - projY) <= maxDist
}

function findLink(
  mouseX: number,
  mouseY: number,
  gridData: Map<string, LinkType[]>,
) {
  const cellSize = 150

  const cx = Math.floor(mouseX / cellSize)
  const cy = Math.floor(mouseY / cellSize)

  const key = `${cx},${cy}`
  const candidates = gridData.get(key)
  if (!candidates) return null

  const sortedCandidates = candidates
    .slice()
    .sort((a, b) => (b.drawIndex ?? 0) - (a.drawIndex ?? 0))

  for (const link of sortedCandidates) {
    if (pointNearLine(mouseX, mouseY, link)) {
      return link
    }
  }

  return null
}
