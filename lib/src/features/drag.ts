import React from 'react'
import { NodeType } from '../typings'

export type UseDragParameters = {
  canvas: React.RefObject<HTMLCanvasElement | null>
  nodes: React.RefObject<NodeType[]>
  draw: () => void
  nodeRadius: number
}

export function useDrag({
  canvas,
  nodes,
  draw,
  nodeRadius,
}: UseDragParameters) {
  const draggingNodeRef = React.useRef<NodeType | null>(null)

  /**TODO: Rename */
  function getCursorCoords(event: PointerEvent) {
    const rect = canvas.current!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    return { x, y }
  }

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      console.log('handlePointerDown')
      const { x, y } = getCursorCoords(event)

      for (let i = nodes.current.length - 1; i >= 0; i--) {
        const node = nodes.current[i]
        const dx = x - node.x!
        const dy = y - node.y!
        if (dx * dx + dy * dy < nodeRadius * nodeRadius) {
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

      const { x, y } = getCursorCoords(event)

      draggingNodeRef.current.fx = x
      draggingNodeRef.current.fy = y

      draw()
    }

    function handlePointerUp() {
      if (draggingNodeRef.current) {
        draggingNodeRef.current.fx = null
        draggingNodeRef.current.fy = null
        draggingNodeRef.current = null
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
  }, [canvas, nodes, draw])
}
