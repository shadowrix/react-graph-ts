import React from 'react'

import { select, zoom, ZoomTransform } from 'd3'

export type UseZoomParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  transformRef: React.RefObject<ZoomTransform>
  draw: () => void
}

export function useZoom({ canvasRef, transformRef, draw }: UseZoomParameters) {
  React.useEffect(() => {
    const zoomFn = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.03, 8])
      .on('zoom', (event) => {
        transformRef.current = event.transform
        draw()
      })

    select(canvasRef.current!).call(zoomFn)
  }, [])
}
