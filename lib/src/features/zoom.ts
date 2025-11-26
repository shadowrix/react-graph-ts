import React from 'react'

import { select, zoom } from 'd3'
import { RefState } from '../state'

export type UseZoomParameters = {
  state: RefState
  draw: () => void
}

export function useZoom({ state, draw }: UseZoomParameters) {
  React.useEffect(() => {
    const zoomFn = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.03, 8])
      .on('zoom', (event) => {
        state.current.transform = event.transform
        draw()
        state.current.isDragging = true
      })
      .on('end', () => (state.current.isDragging = false))

    select(state.current.canvas!).call(zoomFn)

    return () => {
      select(state.current.canvas!).on('.zoom', null)
    }
  }, [])
}
