import React from 'react'
import * as d3 from 'd3'

import { NodeType } from '../typings'
import { getCursorCoords } from '../helpers'

export type UseDragParameters = {
  canvas: React.RefObject<HTMLCanvasElement | null>
  nodes: React.RefObject<NodeType[]>
  draw: () => void
  nodeRadius: number
  simulationRef: React.RefObject<d3.Simulation<NodeType, undefined> | null>
  alphaDecay: number
  isFixed: boolean
}

export function useDrag({
  draw,
  nodes,
  canvas,
  isFixed,
  alphaDecay,
  nodeRadius,
  simulationRef,
}: UseDragParameters) {
  const draggingNodeRef = React.useRef<NodeType | null>(null)

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const { x, y } = getCursorCoords(event, canvas.current!)

      for (let i = nodes.current.length - 1; i >= 0; i--) {
        const node = nodes.current[i]
        const distanceX = x - node.x!
        const distanceY = y - node.y!
        if (
          distanceX * distanceX + distanceY * distanceY <
          nodeRadius * nodeRadius
        ) {
          draggingNodeRef.current = node
          draggingNodeRef.current.fx = x
          draggingNodeRef.current.fy = y
          event.stopPropagation()
          draw()
          return
        }
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (!draggingNodeRef.current) return

      const { x, y } = getCursorCoords(event, canvas.current!)

      draggingNodeRef.current.fx = x
      draggingNodeRef.current.fy = y

      simulationRef.current!.alphaTarget(alphaDecay).restart()

      draw()
    }

    function handlePointerUp() {
      if (draggingNodeRef.current) {
        if (!isFixed) {
          draggingNodeRef.current.fx = null
          draggingNodeRef.current.fy = null
        }
        draggingNodeRef.current = null
        simulationRef.current!.alphaTarget(0)
        draw()
      }
    }

    canvas.current?.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      canvas.current?.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [canvas, nodes, draw, isFixed])
}
