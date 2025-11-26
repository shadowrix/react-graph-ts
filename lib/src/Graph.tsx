import React from 'react'

import { quadtree } from 'd3'
import {
  Colors,
  LinkColorFn,
  DetectNodeColorFn,
  GetLabelFn,
  LinkType,
  NodeType,
  OnClickFn,
  Settings,
  LinkLabelFn,
} from './typings'
import { drawAllLinks, drawAllNodes, drawLinkTooltip } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'
import { useInitialize } from './features/initialize'
import { assignCurves, buildLinkGrid } from './helpers'

export type GraphProps<TLink extends {}, TNode extends {}> = {
  isFixed?: boolean
  settings?: Partial<Settings>
  onClick?: OnClickFn<TNode, TLink>
  //LINKS
  links: LinkType<TLink>[]
  dashedLinks?: boolean
  colors?: Partial<Colors>
  linkColor?: LinkColorFn<TLink>
  linkLabel?: LinkLabelFn<TLink>
  //NODES
  nodes: NodeType<TNode>[]
  getLabel?: GetLabelFn<TNode>
  nodeColor?: DetectNodeColorFn<TNode>
}

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

function GraphComponent<TLink extends {}, TNode extends {}>(
  props: GraphProps<TLink, TNode>,
  ref: React.ForwardedRef<HTMLCanvasElement>,
) {
  const { refs: state, register } = useRefManager()
  const [sizes, setSizes] = React.useState({
    width: 0,
    height: 0,
  })

  React.useEffect(() => {
    register('canvas')(
      (ref as unknown as React.RefObject<HTMLCanvasElement>)!.current,
    )
  }, [])

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
    state.current.colors = {
      ...state.current.colors,
      ...(props.colors ?? {}),
    }
  }, [props.colors])

  React.useEffect(() => {
    state.current.settings = {
      ...state.current.settings,
      ...(props.settings ?? {}),
    }
  }, [props.settings])

  const handleClick = (...params: Parameters<OnClickFn<TNode, TLink>>) => {
    props.onClick?.(...params)
  }

  const getNodeLabel = (...params: Parameters<GetLabelFn<TNode>>) => {
    if (props.getLabel) {
      return props.getLabel(...params)
    }

    const [node] = params
    return node?.id
  }

  const getLinkLabel = (...params: Parameters<LinkLabelFn<TLink>>) => {
    if (props.linkLabel) {
      return props.linkLabel(...params)
    }

    const [link] = params
    return link?.id
  }

  const handleDetectNodeColor = (
    ...params: Parameters<DetectNodeColorFn<TNode>>
  ) => {
    if (props.nodeColor) {
      return props.nodeColor(...params)
    }
    const [_, isHover] = params
    if (isHover) {
      return state.current.colors.nodeHover
    }
    return state.current.colors.node
  }

  const handleLinkColor = (...params: Parameters<LinkColorFn<TLink>>) => {
    if (props.linkColor) {
      return props.linkColor(...params)
    }
    const [_, isHover] = params
    if (isHover) {
      return state.current.colors.linkHover
    }
    return state.current.colors.link
  }

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

      drawAllLinks(state, handleLinkColor as any)
      drawAllNodes(
        state,
        state.current.settings.nodeRadius,
        getNodeLabel as any,
        handleDetectNodeColor as any,
      )
      if (
        state.current!.hoveredData.pointer?.x &&
        state.current!.hoveredData.pointer?.y
      ) {
        drawLinkTooltip(
          state,
          state.current!.hoveredData.pointer?.x,
          state.current!.hoveredData.pointer?.y,
          getLinkLabel as any,
        )
      }
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

  const startAnimationLoop = React.useCallback(function startAnimationLoop() {
    function animate() {
      requestRender()
      if (
        state.current.settings.withParticles &&
        (state.current.hoveredData.link || state.current.hoveredData.node)
      ) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  useInitialize({
    state,
    isFixed: props.isFixed,
    draw: requestRender,
    updateCache,
    nodes: props.nodes as any,
    links: props.links as any,
    settings: props.settings,
    dashedLinks: props.dashedLinks,
    colors: props.colors,
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
    draw: startAnimationLoop,
    getPointerCoords,
    handleClick: handleClick as any,
  })

  return <canvas ref={ref} width={sizes.width} height={sizes.height} />
}

export const Graph = React.forwardRef(GraphComponent) as <
  TLink extends {},
  TNode extends {},
>(
  props: GraphProps<TNode, TLink> & {
    ref?: React.ForwardedRef<HTMLCanvasElement>
  },
) => ReturnType<typeof GraphComponent>
