import { drag } from 'd3-drag'
import { select } from 'd3-selection'

import { State } from '../typings/state'

export type HandleDragParameters = {
  state: State
  setIsGraphChange: (isChanged: boolean) => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function handleDrag({
  state,
  setIsGraphChange,
  getPointerCoords,
}: HandleDragParameters) {
  state.unSubscribeFeatures.handleDrag?.()

  const canvas = state!.canvas!

  function findNode(x: number, y: number) {
    if (!state?.externalState?.settings?.nodeRadius) return
    return state!.externalState.nodes?.find(
      (n) =>
        Math.hypot(n.x! - x, n.y! - y) <
        state!.externalState!.settings!.nodeRadius!,
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
        state.simulationEngine
          ?.alphaTarget(state!.externalState!.settings.alphaDecay! ?? 0.05)
          .restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    })
    .on('drag', (event) => {
      state!.isDragging = true
      const displacementX = event.dx / state!.transform.k
      const displacementY = event.dy / state!.transform.k

      event.subject.x = event.subject.fx + displacementX
      event.subject.y = event.subject.fy + displacementY
      event.subject.fx = event.subject.fx + displacementX
      event.subject.fy = event.subject.fy + displacementY
    })
    .on('end', (event) => {
      if (!event.active) state!.simulationEngine?.alphaTarget(0)
      state!.isDragging = false
      setIsGraphChange(true)
      if (
        state!.externalState?.settings?.isFixed ||
        state!.externalState?.settings?.isFixedNodeAfterDrag
      ) {
        return
      }
      event.subject.fx = null
      event.subject.fy = null
    })

  select(canvas).call(dragFn)

  return () => {
    select(canvas).on('.drag', null)
  }
}
