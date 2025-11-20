import { select, zoom, ZoomTransform } from 'd3'
import React from 'react'

export type UseZoomParameters = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  transformRef: React.RefObject<ZoomTransform>
  contextRef: React.RefObject<CanvasRenderingContext2D | null>
  draw: () => void
}

export function useZoom({
  canvasRef,
  transformRef,
  contextRef,
  draw,
}: UseZoomParameters) {
  React.useEffect(() => {
    const zoomFn = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.03, 8])
      .on('zoom', (event) => {
        // console.log(dpr)
        const dpr = window.devicePixelRatio || 1
        // contextRef.current?.setTransform(
        //   dpr * event.transform.k,
        //   0,
        //   0,
        //   dpr * event.transform.k,
        //   dpr * event.transform.x,
        //   dpr * event.transform.y,
        // )
        // console.log(event.transform)
        // console.log("zoom transform", event.transform);
        transformRef.current = event.transform
        draw()
      })

    select(canvasRef.current!).call(zoomFn)
  }, [])
}
