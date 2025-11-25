import React, { useEffectEvent } from 'react'

import { quadtree, unixDay } from 'd3'
import { DetectNodeColorFn, LinkType, NodeType, OnClickFn } from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'
import { useInitialize } from './features/initialize'
import { assignCurves, buildLinkGrid } from './helpers'

export type GraphProps = {
  nodes: NodeType[]
  links: LinkType[]
  isFixed: boolean
  onClick?: OnClickFn
  detectNodeColor?: DetectNodeColorFn
}

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

export function Graph(props: GraphProps) {
  const { refs: state, register } = useRefManager()

  React.useEffect(() => {
    state.current.settings.isFixed = props.isFixed
    state.current.settings.alphaDecay = props.isFixed
      ? FIXED_ALPHA_DECAY
      : ALPHA_DECAY
  }, [props.isFixed])

  const handleClick = useEffectEvent((...params: Parameters<OnClickFn>) => {
    props.onClick?.(...params)
  })

  const handleDetectNodeColor = useEffectEvent(
    (...params: Parameters<DetectNodeColorFn>) => {
      if (props.detectNodeColor) {
        return props.detectNodeColor(...params)
      }
      const [_, isHover] = params
      if (isHover) {
        return state.current.colors.nodeHover
      }
      return state.current.colors.node
    },
  )

  /** SET NODES AND LINKS */
  React.useEffect(() => {
    state.current.nodes = JSON.parse(JSON.stringify(props.nodes))
    const links = assignCurves(props.links)
    console.log('links --->', links)
    state.current.links = links
  }, [props.nodes, props.links])

  const clearCanvas = React.useCallback(function clearCanvas(
    context: CanvasRenderingContext2D,
  ) {
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = state.current.colors.background
    context.fillRect(
      0,
      0,
      state.current.settings.width,
      state.current.settings.height,
    )
    context.restore()
  }, [])

  function getPointerCoords(clientX: number, clientY: number) {
    const rect = state.current.canvas!.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return state.current.transform.invert([x, y])
  }

  const draw = React.useCallback(
    function draw() {
      if (!state.current.context) return

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
      drawAllNodes(
        state,
        state.current.settings.nodeRadius,
        handleDetectNodeColor,
      )
    },
    [clearCanvas],
  )

  const requestRender = React.useCallback(
    function requestRender() {
      if (state.current.isRequestRendering) return
      state.current.isRequestRendering = true
      requestAnimationFrame(() => {
        state.current.isRequestRendering = false
        draw()
      })
    },
    [draw],
  )

  const updateLinkGrid = React.useCallback(function updateLinkGrid() {
    const grid = buildLinkGrid(state.current.links)
    console.log(grid)
    state.current.linksGrid = grid
  }, [])

  const updateNodesCache = React.useCallback(function updateNodesCache() {
    state.current.nodesCache = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(state.current.nodes)
  }, [])

  const updateCache = React.useCallback(
    function updateCache() {
      updateNodesCache()
      updateLinkGrid()
    },
    [updateNodesCache, updateLinkGrid],
  )

  useInitialize({
    state,
    isFixed: props.isFixed,
    draw: requestRender,
    updateCache,
  })

  useDrag({
    state,
    updateCache,
    getPointerCoords,
    draw: requestRender,
  })

  useZoom({
    state,
    draw: requestRender,
  })

  useHandlers({
    state,
    draw: requestRender,
    getPointerCoords,
    handleClick,
  })

  return (
    <canvas
      ref={register('canvas')}
      width={state.current.settings.width}
      height={state.current.settings.height}
    />
  )
}
