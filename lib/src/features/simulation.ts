import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'

import { INITIAL_STATE } from '../state'
import { State } from '../typings/state'

export type HandleSimulationParams = {
  state: State
  setIsGraphChange: (isChanged: boolean) => void
}

export function handleSimulation({
  state,
  setIsGraphChange,
}: HandleSimulationParams) {
  state.unSubscribeFeatures.handleSimulation?.()
  /** INITIALIZE */
  const canvas = state.canvas!
  const context = canvas.getContext('2d')!
  state.context = context
  let tickCounter = 0

  state.simulationEngine?.stop()

  state.simulationEngine = forceSimulation(state.externalState.nodes)
    .force(
      'link',
      forceLink(state.externalState.links)
        .id((d) => (d as { id: string }).id)
        .distance(
          state?.externalState?.settings?.linkDistance ??
            INITIAL_STATE.externalState.settings.linkDistance!,
        )
        .strength(
          state?.externalState?.settings?.linkStrength ??
            INITIAL_STATE.externalState.settings.linkStrength!,
        ),
    )
    .force('charge', forceManyBody().strength(-200))
    //TODO: Add width and height from parent
    .force(
      'center',
      forceCenter(
        state.externalState.width / 2,
        state.externalState.height / 2,
      ),
    )
    .force(
      'collision',
      forceCollide(
        () =>
          Number(
            state?.externalState?.settings?.nodeRadius ??
              INITIAL_STATE.externalState.settings.nodeRadius,
          ) + 4,
      ),
    )
    .alphaDecay(
      state?.externalState?.settings?.alphaDecay ??
        INITIAL_STATE.externalState.settings.alphaDecay!,
    )
    .on('tick', () => {
      tickCounter++
      if (tickCounter % 6 === 0) {
        setIsGraphChange(true)
      }
    })
    .on('end', () => {
      if (state?.externalState?.settings?.isFixed) {
        state.externalState.nodes.forEach((node) => {
          node.fx = node.fx ?? node.x
          node.fy = node.fy ?? node.y
        })
      }
      setIsGraphChange(true)
    })

  return () => {
    state.simulationEngine?.stop()
  }
}
