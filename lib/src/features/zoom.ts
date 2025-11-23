import React from 'react'

import { select, zoom, ZoomTransform } from 'd3'

export type UseZoomParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  transformRef: React.RefObject<ZoomTransform>
  isDraggingRef: React.RefObject<boolean>
  draw: () => void
}

export function useZoom({
  canvasRef,
  isDraggingRef,
  transformRef,
  draw,
}: UseZoomParameters) {
  React.useEffect(() => {
    const zoomFn = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.03, 8])
      .on('zoom', (event) => {
        transformRef.current = event.transform
        draw()
      })
      .on('start', () => (isDraggingRef.current = true))
      .on('end', () => (isDraggingRef.current = false))

    select(canvasRef.current!).call(zoomFn)
  }, [])
}
