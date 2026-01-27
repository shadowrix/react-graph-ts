import { quadtree } from 'd3-quadtree'

import { INITIAL_STATE } from '../state'
import { NodeType } from '../typings'
import { buildLinkGrid } from '../helpers'
import { drawAllLinks, drawAllNodes, drawLasso, drawLinkTooltip } from './draw'
import { State } from '../typings/state'

export function engine(state: State) {
  state.unSubscribeFeatures.engine?.()

  let frameId: number | null = null
  //TODO: isRequestRendering Remove from state
  let isRequestRendering = false

  function updateLinkGrid() {
    if (!state?.externalState?.settings?.nodeRadius)
      console.error(
        'The nodeRadius field is missing or set to zero in the configuration.',
      )

    const grid = buildLinkGrid(
      state!.externalState.links,
      state?.externalState?.settings?.nodeRadius ?? 8,
    )
    state!.linksGrid = grid
  }

  function updateNodesCache() {
    state!.nodesCache = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(state!.externalState.nodes)
  }

  function updateCache() {
    updateNodesCache()
    updateLinkGrid()
  }

  function clearCanvas(context: CanvasRenderingContext2D) {
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle =
      state!.externalState?.colors?.background ??
      INITIAL_STATE.externalState.colors.background!
    context.fillRect(
      0,
      0,
      state!.externalState.width,
      state!.externalState.height,
    )
    context.restore()
  }

  function draw() {
    if (!state?.context) return
    clearCanvas(state.context)
    state.context?.setTransform(
      state.transform.k,
      0,
      0,
      state.transform.k,
      state.transform.x,
      state.transform.y,
    )
    // console.log(state.externalState.nodes)
    drawAllLinks(state)
    drawAllNodes(state)
    if (state!.hoveredData.pointer?.x && state!.hoveredData.pointer?.y) {
      drawLinkTooltip(
        state,
        state!.hoveredData.pointer?.x,
        state!.hoveredData.pointer?.y,
      )
    }
    if (state.isLassoing) {
      drawLasso(state)
    }
  }

  function animate() {
    if (state?.isGraphChanged) {
      state.isGraphChanged = false
      updateCache()
    }
    draw()
    // console.log(state.externalState.nodes, state.externalState.links, state.canvas, state.context)
    frameId = requestAnimationFrame(animate)
  }
  frameId = requestAnimationFrame(animate)

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }
  }
}
