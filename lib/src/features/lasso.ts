import React from 'react'
import { RefState } from '../state'
import { polygonContains } from 'd3'
import { NodeType } from '../typings'

export type UseLassoParameters = {
  state: RefState
  draw: () => void
  getPointerCoords: (clientX: number, clientY: number) => [number, number]
  onSelectedNode: (nodes: NodeType[]) => void
}

export function useLasso({
  state,
  draw,
  getPointerCoords,
  onSelectedNode,
}: UseLassoParameters) {
  // const path = geoPath().context(context)

  // const draw = () => {
  //   console.log('draw')
  //   context.beginPath()

  //   path({
  //     type: 'LineString',
  //     coordinates: polygonOutline,
  //   })

  //   context.fill('evenodd')
  //   context.setLineDash([4, 8])
  //   context.lineWidth = 1
  //   context.fillStyle = 'rgba(0,0,0,.1)'
  //   context.strokeStyle = '#363740'
  //   context.stroke()
  // }

  React.useEffect(() => {
    // const canvas = select(state.current!.canvas!)

    function handlePointerDown(event: PointerEvent) {
      if (!(event.ctrlKey || event.altKey || event.metaKey)) {
        return
      }
      state.current!.isLassoing = true
      state.current!.lassoPath = [
        getPointerCoords(event.clientX, event.clientY),
      ]
    }

    function handlePointerMove(event: PointerEvent) {
      if (!state.current!.isLassoing) return
      state.current!.lassoPath = [
        ...(state.current!.lassoPath ?? []),
        getPointerCoords(event.clientX, event.clientY),
      ]
      draw()
    }

    function handlePointerUp() {
      if (!state.current!.isLassoing) return
      state.current!.isLassoing = false
      const selectedNodes = state.current!.nodes?.filter((node) =>
        polygonContains(state.current!.lassoPath, [node.x!, node.y!]),
      )
      onSelectedNode(selectedNodes)
      draw()
    }

    state.current!.canvas!.addEventListener('pointerdown', handlePointerDown)
    state.current!.canvas!.addEventListener('pointermove', handlePointerMove)
    state.current!.canvas!.addEventListener('pointerup', handlePointerUp)
    return () => {
      state.current!.canvas!.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )
      state.current!.canvas!.removeEventListener(
        'pointermove',
        handlePointerMove,
      )
      state.current!.canvas!.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draw, onSelectedNode])
}
