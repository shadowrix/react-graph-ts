import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3'
import React from 'react'
import { RefState } from '../state'

export type UseInitializeParameters = {
  state: RefState
  isFixed: boolean
  alphaDecay: number
  updateCache: () => void
  draw: () => void
}

export function useInitialize({
  state,
  isFixed,
  alphaDecay,
  draw,
  updateCache,
}: UseInitializeParameters) {
  /** INITIALIZE */
  React.useEffect(() => {
    const canvas = state.current.canvas!
    const context = canvas.getContext('2d')!
    state.current.context = context
    let tickCounter = 0

    state.current.simulationEngine = forceSimulation(state.current.nodes)
      .force(
        'link',
        forceLink(state.current.links)
          .id((d) => (d as { id: string }).id)
          .distance(state.current.settings.linkDistance)
          .strength(state.current.settings.linkStrength),
      )
      .force('charge', forceManyBody().strength(-100))
      //TODO: Add width and height from parent
      .force(
        'center',
        forceCenter(
          state.current.settings.width / 2,
          state.current.settings.height / 2,
        ),
      )
      .alphaDecay(alphaDecay)
      .on('tick', () => {
        draw()
        tickCounter++
        if (tickCounter % 6 === 0) {
          updateCache()
        }
      })
      .on('end', () => {
        if (isFixed) {
          state.current.nodes.forEach((node) => {
            node.fx = node.x
            node.fy = node.y
          })
        }
        updateCache()
      })
  }, [isFixed])
}
