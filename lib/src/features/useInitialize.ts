import React from 'react'

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'

import { RefState } from '../state'
import { LinkType, NodeType, Settings } from '../typings'

export type UseInitializeParameters = {
  state: RefState
  isFixed?: boolean
  nodes: NodeType
  links: LinkType
  sizes: { width: number; height: number }
  settings?: Partial<Settings>
  setIsGraphChange: (isChanged: boolean) => void
}

export function useInitialize({
  nodes,
  links,
  state,
  sizes,
  isFixed,
  settings,
  setIsGraphChange,
}: UseInitializeParameters) {
  /** INITIALIZE */
  React.useEffect(() => {
    const canvas = state.current!.canvas!
    const context = canvas.getContext('2d')!
    state.current!.context = context
    let tickCounter = 0

    state.current!.simulationEngine?.stop()

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
        forceCenter(state.current!.width / 2, state.current!.height / 2),
      )
      .force(
        'collision',
        forceCollide(() => Number(state.current?.settings.nodeRadius) + 4),
      )
      .alphaDecay(state.current!.settings.alphaDecay)
      .on('tick', () => {
        tickCounter++
        if (tickCounter % 6 === 0) {
          setIsGraphChange(true)
        }
      })
      .on('end', () => {
        if (state.current!.settings.isFixed) {
          state.current!.nodes.forEach((node) => {
            node.fx = node.fx ?? node.x
            node.fy = node.fy ?? node.y
          })
        }
        setIsGraphChange(true)
      })

    return () => {
      state.current!.simulationEngine?.stop()
    }
  }, [isFixed, nodes, links, sizes])
}
