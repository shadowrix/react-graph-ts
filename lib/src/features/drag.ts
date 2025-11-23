import React from 'react'

import { drag, select } from 'd3'
import { RefState } from '../state'

export type UseDragParameters = {
  state: RefState
  draw: () => void
  findNode: (x: number, y: number) => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
  updateNodesCache: () => void
  buildLinkGrid: () => void
  alphaDecay: number
  isFixed: boolean
}

export function useDrag({
  state,
  draw,
  findNode,
  updateNodesCache,
  buildLinkGrid,
  getPointerCoords,
  isFixed,
  alphaDecay,
}: UseDragParameters) {
  React.useEffect(() => {
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
          state.current.simulationEngine?.alphaTarget(alphaDecay).restart()
        state.current.isDragging = true
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        const displacementX = event.dx / state.current.transform.k
        const displacementY = event.dy / state.current.transform.k

        event.subject.x = event.subject.fx + displacementX
        event.subject.y = event.subject.fy + displacementY
        event.subject.fx = event.subject.fx + displacementX
        event.subject.fy = event.subject.fy + displacementY
      })
      .on('end', (event) => {
        if (!event.active) state.current.simulationEngine?.alphaTarget(0)
        if (!isFixed) {
          event.subject.fx = null
          event.subject.fy = null
        }
        state.current.isDragging = false
        updateNodesCache()
        buildLinkGrid()
      })

    select(state.current.canvas!).call(dragFn)
  }, [draw, updateNodesCache, buildLinkGrid, isFixed])
}
