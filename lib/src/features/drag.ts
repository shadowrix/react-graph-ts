import React from 'react'

import { NodeType } from '../typings'
import { drag, select, ZoomTransform } from 'd3'

export type UseDragParameters = {
  canvas: React.RefObject<HTMLCanvasElement | null>
  nodes: React.RefObject<NodeType[]>
  transformRef: React.RefObject<ZoomTransform>
  draw: () => void
  findNode: (x: number, y: number) => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
  updateNodesCache: () => void
  nodeRadius: number
  simulationRef: React.RefObject<d3.Simulation<NodeType, undefined> | null>
  alphaDecay: number
  isFixed: boolean
}

export function useDrag({
  draw,
  findNode,
  updateNodesCache,
  getPointerCoords,
  nodes,
  canvas,
  isFixed,
  transformRef,
  alphaDecay,
  nodeRadius,
  simulationRef,
}: UseDragParameters) {
  React.useEffect(() => {
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
          simulationRef.current?.alphaTarget(alphaDecay).restart()

        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        const displacementX = event.dx / transformRef.current.k
        const displacementY = event.dy / transformRef.current.k

        event.subject.x = event.subject.fx + displacementX
        event.subject.y = event.subject.fy + displacementY
        event.subject.fx = event.subject.fx + displacementX
        event.subject.fy = event.subject.fy + displacementY
      })
      .on('end', (event) => {
        if (!event.active) simulationRef.current?.alphaTarget(0)
        if (!isFixed) {
          event.subject.fx = null
          event.subject.fy = null
        }
        updateNodesCache()
      })

    select(canvas.current!).call(dragFn)
  }, [canvas, nodes, draw, updateNodesCache, isFixed])
}
