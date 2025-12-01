import React from 'react'
import { RefState } from '../state'
import { polygonContains } from 'd3'

export type UseLassoParameters = {
  state: RefState
  // draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useLasso({
  state,
  // draw,
  getPointerCoords,
}: UseLassoParameters) {
  React.useEffect(() => {
    const canvas = state.current?.canvas!
    function handlePointerDown(event: PointerEvent) {
      if (!(event.ctrlKey || event.altKey || event.metaKey)) {
        return
      }
      state.current!.isLassoing = true
      state.current!.lassoPath = [
        getPointerCoords(event.clientX, event.clientY),
      ]
    }

    function handlePointerMove(event: PointerEvent) {
      if (!state.current!.isLassoing) return
      state.current!.lassoPath = [
        ...(state.current!.lassoPath ?? []),
        getPointerCoords(event.clientX, event.clientY),
      ]
      // draw()
    }

    function handlePointerUp() {
      if (!state.current!.isLassoing) return
      state.current!.isLassoing = false
      const selectedNodes = state.current!.nodes?.filter((node) =>
        polygonContains(state.current!.lassoPath, [node.x!, node.y!]),
      )
      state.current!.onSelectedNode?.(selectedNodes)
      // draw()
    }

    canvas?.addEventListener('pointerdown', handlePointerDown)
    canvas?.addEventListener('pointermove', handlePointerMove)
    canvas?.addEventListener('pointerup', handlePointerUp)
    return () => {
      canvas?.removeEventListener('pointerdown', handlePointerDown)
      canvas?.removeEventListener('pointermove', handlePointerMove)
      canvas?.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])
}
