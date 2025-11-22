import React from 'react'

import { HoveredData, NodeType } from '../typings'
import { Quadtree, ZoomTransform } from 'd3'

export type UseHandlersParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  nodesRef: React.RefObject<NodeType[]>
  nodeRadius: number
  nodesCacheRef: React.RefObject<Quadtree<NodeType> | null>
  hoveredData: React.RefObject<HoveredData>
  transformRef: React.RefObject<ZoomTransform>
  draw: () => void
  // findNode: (x: number, y: number) => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useHandlers({
  canvasRef,
  hoveredData,
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
      const [x, y] = getPointerCoords(event.clientX, event.clientY)

      const hoveredNode = findHoveredNode(x, y, 10)

      if (!hoveredData.current.node && !hoveredNode) return
      if (hoveredData.current.node?.id === hoveredNode?.id) return

      if (hoveredNode) {
        hoveredData.current.node = hoveredNode
      } else {
        hoveredData.current.node = null
      }
      draw()
    }

    canvas.addEventListener('pointermove', handleMove)

    return () => canvas.removeEventListener('pointermove', handleMove)
  }, [draw])
}
