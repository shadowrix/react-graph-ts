import React from 'react'

import { select, zoom } from 'd3'
import { RefState } from '../state'

export type UseZoomParameters = {
  state: RefState
}

export function useZoom({ state }: UseZoomParameters) {
  React.useEffect(() => {
    const canvas = state.current!.canvas!
    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.03, 8])
      .on('zoom', (event) => {
        state.current!.transform = event.transform
        state.current!.isDragging = true
      })
      .on('end', () => (state.current!.isDragging = false))

    select(canvas!).call(zoomBehavior)

    state.current!.zoomBehavior = zoomBehavior

    return () => {
      select(canvas!).on('.zoom', null)
    }
  }, [])
}
