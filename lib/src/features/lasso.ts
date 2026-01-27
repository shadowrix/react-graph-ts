import { polygonContains } from 'd3-polygon'

import { State } from '../typings/state'

export type HandleLassoParams = {
  state: State
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
}

export function handleLasso({ state, getPointerCoords }: HandleLassoParams) {
  state.unSubscribeFeatures.handleLasso?.()
  function handlePointerDown(event: PointerEvent) {
    if (!(event.ctrlKey || event.altKey || event.metaKey)) {
      return
    }
    state.isLassoing = true
    state.lassoPath = [getPointerCoords(event.clientX, event.clientY)]
  }

  function handlePointerMove(event: PointerEvent) {
    if (!state.isLassoing) return
    state.lassoPath = [
      ...(state.lassoPath ?? []),
      getPointerCoords(event.clientX, event.clientY),
    ]
  }

  function handlePointerUp() {
    if (!state.isLassoing) return
    state.isLassoing = false
    const selectedNodes = state.externalState.nodes?.filter((node) =>
      polygonContains(state.lassoPath, [node.x!, node.y!]),
    )
    state.externalState.handlers?.onSelectedNode?.(selectedNodes)
  }

  state.canvas?.addEventListener('pointerdown', handlePointerDown)
  state.canvas?.addEventListener('pointermove', handlePointerMove)
  state.canvas?.addEventListener('pointerup', handlePointerUp)
  return () => {
    state.canvas?.removeEventListener('pointerdown', handlePointerDown)
    state.canvas?.removeEventListener('pointermove', handlePointerMove)
    state.canvas?.removeEventListener('pointerup', handlePointerUp)
  }
}
