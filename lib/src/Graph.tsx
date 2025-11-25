import React, { useEffectEvent } from 'react'

import { quadtree } from 'd3'
import {
  Colors,
  DetectNodeColorFn,
  GetLabelFn,
  LinkType,
  NodeType,
  OnClickFn,
  Settings,
} from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'
import { useInitialize } from './features/initialize'
import { assignCurves, buildLinkGrid } from './helpers'

export type GraphProps = {
  isFixed?: boolean
  settings?: Settings
  onClick?: OnClickFn
  //LINKS
  links: LinkType[]
  dashedLinks?: boolean
  colors?: Partial<Colors>
  //NODES
  nodes: NodeType[]
  getLabel?: GetLabelFn
  detectNodeColor?: DetectNodeColorFn
}

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

export function Graph(props: GraphProps) {
  const { refs: state, register } = useRefManager()
  const [sizes, setSizes] = React.useState({
    width: 0,
    height: 0,
  })

  React.useEffect(() => {
    state.current.settings.isFixed = props.isFixed ?? false
    state.current.settings.alphaDecay = props.isFixed
      ? FIXED_ALPHA_DECAY
      : ALPHA_DECAY
  }, [props.isFixed])

  React.useEffect(() => {
    state.current.settings.isDashed = Boolean(props.dashedLinks)
  }, [props.dashedLinks])

  React.useEffect(() => {
    state.current.colors = { ...state.current.colors, ...(props.colors ?? {}) }
  }, [props.colors])

  React.useEffect(() => {
    state.current.settings = {
      ...state.current.settings,
      ...(props.settings ?? {}),
    }
  }, [props.settings])

  const handleClick = useEffectEvent((...params: Parameters<OnClickFn>) => {
    props.onClick?.(...params)
  })

  const getLabel = useEffectEvent((...params: Parameters<GetLabelFn>) => {
    if (props.getLabel) {
      return props.getLabel(...params)
    }

    const [node] = params
    return node?.id
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
        getLabel,
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

  /** SIZES */
  React.useEffect(() => {
    if (state.current.canvas?.parentElement) {
      const resizeObserver = new ResizeObserver(() => {
        const width = state.current.canvas!.parentElement!.clientWidth
        const height = state.current.canvas!.parentElement!.clientHeight
        state.current.settings.width = width
        state.current.settings.height = height
        setSizes({
          width,
          height,
        })
        requestRender()
      })

      resizeObserver.observe(document.body)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

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
      width={sizes.width}
      height={sizes.height}
    />
  )
}
