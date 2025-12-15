import React from 'react'
import { RefState } from '../state'
import { drawAllLinks, drawAllNodes, drawLasso, drawLinkTooltip } from './draw'

export function useEngine(state: RefState) {
  const clearCanvas = React.useCallback(function clearCanvas(
    context: CanvasRenderingContext2D,
  ) {
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = state.current!.colors.background
    context.fillRect(0, 0, state.current!.width, state.current!.height)
    context.restore()
  }, [])

  const frameIdRef = React.useRef<number>()

  const draw = React.useCallback(
    function draw() {
      if (!state.current?.context) return
      clearCanvas(state.current.context)
      state.current.context?.setTransform(
        state.current.transform.k,
        0,
        0,
        state.current.transform.k,
        state.current.transform.x,
        state.current.transform.y,
      )

      drawAllLinks(state)
      drawAllNodes(state)
      if (
        state.current!.hoveredData.pointer?.x &&
        state.current!.hoveredData.pointer?.y
      ) {
        drawLinkTooltip(
          state,
          state.current!.hoveredData.pointer?.x,
          state.current!.hoveredData.pointer?.y,
        )
      }
      if (state.current.isLassoing) {
        drawLasso(state)
      }
    },
    [clearCanvas],
  )

  const requestRender = React.useCallback(
    function requestRender() {
      if (state.current?.isRequestRendering) return
      state.current!.isRequestRendering = true
      requestAnimationFrame(() => {
        state.current!.isRequestRendering = false
        draw()
      })
    },
    [draw],
  )

  React.useEffect(() => {
    function animate() {
      requestRender()
      frameIdRef.current = requestAnimationFrame(animate)
    }
    frameIdRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [])
}
