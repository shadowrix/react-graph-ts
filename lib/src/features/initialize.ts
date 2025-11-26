import React from 'react'

import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3'
import { RefState } from '../state'

export type UseInitializeParameters = {
  state: RefState
  isFixed?: boolean
  updateCache: () => void
  draw: () => void
}

export function useInitialize({
  state,
  isFixed,
  draw,
  updateCache,
}: UseInitializeParameters) {
  /** INITIALIZE */
  React.useEffect(() => {
    const canvas = state.current!.canvas!
    const context = canvas.getContext('2d')!
    state.current!.context = context
    let tickCounter = 0

    state.current!.simulationEngine = forceSimulation(state.current!.nodes)
      .force(
        'link',
        forceLink(state.current!.links)
          .id((d) => (d as { id: string }).id)
          .distance(state.current!.settings.linkDistance)
          .strength(state.current!.settings.linkStrength),
      )
      .force('charge', forceManyBody().strength(-200))
      //TODO: Add width and height from parent
      .force(
        'center',
        forceCenter(
          state.current!.settings.width / 2,
          state.current!.settings.height / 2,
        ),
      )
      .alphaDecay(state.current!.settings.alphaDecay)
      .on('tick', () => {
        draw()
        tickCounter++
        if (tickCounter % 6 === 0) {
          updateCache()
        }
      })
      .on('end', () => {
        if (state.current!.settings.isFixed) {
          state.current!.nodes.forEach((node) => {
            node.fx = node.x
            node.fy = node.y
          })
        }
        updateCache()
      })

    return () => {
      state.current!.simulationEngine?.stop()
    }
  }, [isFixed])
}
