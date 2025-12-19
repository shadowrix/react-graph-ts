import React from 'react'
import { quadtree } from 'd3'

import { RefState } from '../state'
import { NodeType } from '../typings'
import { buildLinkGrid } from '../helpers'
import { drawAllLinks, drawAllNodes, drawLasso, drawLinkTooltip } from './draw'

export function useEngine(state: RefState) {
  const frameIdRef = React.useRef<number>()

  const updateLinkGrid = React.useCallback(function updateLinkGrid() {
    if (!state.current?.settings.nodeRadius)
      console.error(
        'The nodeRadius field is missing or set to zero in the configuration.',
      )

    const grid = buildLinkGrid(
      state.current!.links,
      state.current?.settings.nodeRadius ?? 8,
    )
    state.current!.linksGrid = grid
  }, [])

  const updateNodesCache = React.useCallback(function updateNodesCache() {
    state.current!.nodesCache = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(state.current!.nodes)
  }, [])

  const updateCache = React.useCallback(
    function updateCache() {
      updateNodesCache()
      updateLinkGrid()
    },
    [updateNodesCache, updateLinkGrid],
  )

  const clearCanvas = React.useCallback(function clearCanvas(
    context: CanvasRenderingContext2D,
  ) {
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = state.current!.colors.background
    context.fillRect(0, 0, state.current!.width, state.current!.height)
    context.restore()
  }, [])

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
      if (state.current?.isGraphChanged) {
        state.current.isGraphChanged = false
        updateCache()
      }
      requestRender()
      frameIdRef.current = requestAnimationFrame(animate)
    }
    frameIdRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [updateCache])
}
