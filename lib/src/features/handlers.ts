import React from 'react'

import { HoveredData, NodeType } from '../typings'
import { Quadtree } from 'd3'

export type UseHandlersParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  nodeRadius: number
  nodesCacheRef: React.RefObject<Quadtree<NodeType> | null>
  hoveredData: React.RefObject<HoveredData>
  draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useHandlers({
  canvasRef,
  nodeRadius,
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

      const hoveredNode = findHoveredNode(x, y, nodeRadius)

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
