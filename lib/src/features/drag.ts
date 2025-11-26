import React from 'react'

import { drag, select } from 'd3'
import { RefState } from '../state'

export type UseDragParameters = {
  state: RefState
  draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
  updateCache: () => void
}

export function useDrag({
  state,
  draw,
  updateCache,
  getPointerCoords,
}: UseDragParameters) {
  React.useEffect(() => {
    function findNode(x: number, y: number) {
      return state.current!.nodes.find(
        (n) =>
          Math.hypot(n.x! - x, n.y! - y) < state.current!.settings.nodeRadius,
      )
    }

    const dragFn = drag<HTMLCanvasElement, any>()
      .subject((event) => {
        const [x, y] = getPointerCoords(
          event.sourceEvent.clientX,
          event.sourceEvent.clientY,
        )

        return findNode(x, y)
      })
      .on('start', (event) => {
        if (!event.active)
          state
            .current!.simulationEngine?.alphaTarget(
              state.current!.settings.alphaDecay,
            )
            .restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        state.current!.isDragging = true
        const displacementX = event.dx / state.current!.transform.k
        const displacementY = event.dy / state.current!.transform.k

        event.subject.x = event.subject.fx + displacementX
        event.subject.y = event.subject.fy + displacementY
        event.subject.fx = event.subject.fx + displacementX
        event.subject.fy = event.subject.fy + displacementY
      })
      .on('end', (event) => {
        if (!event.active) state.current!.simulationEngine?.alphaTarget(0)
        if (!state.current!.settings.isFixed) {
          event.subject.fx = null
          event.subject.fy = null
        }
        state.current!.isDragging = false
        updateCache()
      })

    select(state.current!.canvas!).call(dragFn)

    return () => {
      select(state.current!.canvas!).on('.drag', null)
    }
  }, [draw])
}
