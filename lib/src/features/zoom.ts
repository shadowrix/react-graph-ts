import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'

import { State } from '../typings/state'

export type HandleZoomParameters = {
  state: State
}

export function handleZoom({ state }: HandleZoomParameters) {
  state.unSubscribeFeatures.handleZoom?.()
  state.transform = zoomIdentity

  const canvas = state.canvas!
  const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.03, 8])
    .on('zoom', (event) => {
      state.transform = event.transform
      state.isDragging = true
    })
    .on('end', () => (state.isDragging = false))

  select(canvas!).call(zoomBehavior)

  state.zoomBehavior = zoomBehavior

  return () => {
    select(canvas!).on('.zoom', null)
  }
}
