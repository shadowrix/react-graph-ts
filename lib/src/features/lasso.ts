import React from 'react'
import { RefState } from '../state'
import { polygonContains } from 'd3'

export type UseLassoParameters = {
  state: RefState
  draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function useLasso({
  state,
  draw,
  getPointerCoords,
}: UseLassoParameters) {
  React.useEffect(() => {
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
      draw()
    }

    function handlePointerUp() {
      if (!state.current!.isLassoing) return
      state.current!.isLassoing = false
      const selectedNodes = state.current!.nodes?.filter((node) =>
        polygonContains(state.current!.lassoPath, [node.x!, node.y!]),
      )
      state.current!.onSelectedNode?.(selectedNodes)
      draw()
    }

    state.current!.canvas!.addEventListener('pointerdown', handlePointerDown)
    state.current!.canvas!.addEventListener('pointermove', handlePointerMove)
    state.current!.canvas!.addEventListener('pointerup', handlePointerUp)
    return () => {
      state.current!.canvas!.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )
      state.current!.canvas!.removeEventListener(
        'pointermove',
        handlePointerMove,
      )
      state.current!.canvas!.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draw])
}
