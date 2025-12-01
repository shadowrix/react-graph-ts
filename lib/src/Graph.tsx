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
  GraphRef,
  OnSelectedNodesFn,
  DrawNodeFn,
} from './typings'
import {
  drawAllLinks,
  drawAllNodes,
  drawLasso,
  drawLinkTooltip,
} from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'
import { useInitialize } from './features/initialize'
import {
  assignCurves,
  buildLinkGrid,
  centerAt,
  zoom,
  zoomToFit,
} from './helpers'
import { useLasso } from './features/lasso'

export type GraphProps<TLink extends {}, TNode extends {}> = {
  id?: string
  isFixed?: boolean
  settings?: Partial<Settings>
  onClick?: OnClickFn<TNode, TLink>
  //LINKS
  links: LinkType<TLink>[]
  dashedLinks?: boolean
  colors?: Partial<Colors>
  linkColor?: LinkColorFn<TLink>
  linkLabel?: LinkLabelFn<TLink>
  enablePanInteraction?: boolean
  //NODES
  nodes: NodeType<TNode>[]
  getLabel?: GetLabelFn<TNode>
  nodeColor?: DetectNodeColorFn<TNode>
  onSelectedNode?: OnSelectedNodesFn<TNode>
  drawNode?: DrawNodeFn<TNode>
}

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

function GraphComponent<TLink extends {}, TNode extends {}>(
  props: GraphProps<TLink, TNode>,
  ref: React.ForwardedRef<GraphRef>,
) {
  const { refs: state, register } = useRefManager()
  const [sizes, setSizes] = React.useState({
    width: 0,
    height: 0,
  })

  React.useImperativeHandle(ref, () => ({
    getPointerCoords(x, y) {
      return getPointerCoords(x, y)
    },
    onRenderFramePre(cb: () => void) {
      state.current.preRenderCb = cb
    },
    zoom: (scale: number, duration?: number) => {
      zoom(state, scale, duration)
    },
    centerAt: (x: number, y: number, duration?: number) => {
      centerAt(state, x, y, duration)
    },
  }))

  React.useEffect(() => {
    state.current.enablePanInteraction = props.enablePanInteraction ?? true
  }, [props.enablePanInteraction])

  React.useEffect(() => {
    if (state.current.settings.isFixed !== props.isFixed && !props.isFixed) {
      state.current.nodes?.forEach((node) => {
        node.fx = undefined
        node.fy = undefined
      })
    }
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

  /** SET FUNCTIONS */
  React.useEffect(() => {
    if (props.getLabel) {
      state.current!.getLabel = props.getLabel as GetLabelFn
      return
    }
    state.current!.getLabel = (...params: Parameters<GetLabelFn>) => {
      const [node] = params
      return node?.id
    }
  }, [props.getLabel])
  React.useEffect(() => {
    if (props.nodeColor) {
      state.current!.nodeColor = props.nodeColor as DetectNodeColorFn
      return
    }
    state.current!.nodeColor = (...params: Parameters<DetectNodeColorFn>) => {
      const [_, isHover] = params
      if (isHover) {
        return state.current.colors.nodeHover
      }
      return state.current.colors.node
    }
  }, [props.nodeColor])
  React.useEffect(() => {
    if (props.onSelectedNode) {
      state.current!.onSelectedNode = props.onSelectedNode as OnSelectedNodesFn
    }
  }, [props.onSelectedNode])
  React.useEffect(() => {
    if (props.drawNode) {
      state.current!.drawNode = props.drawNode as DrawNodeFn
    }
  }, [props.drawNode])
  React.useEffect(() => {
    if (props.linkColor) {
      state.current!.linkColor = props.linkColor as LinkColorFn
      return
    }
    state.current!.linkColor = (...params: Parameters<LinkColorFn>) => {
      const [link, isHover] = params
      if (isHover) {
        return state.current.colors.linkHover
      }
      return link.settings?.color ?? state.current.colors.link
    }
  }, [props.linkColor])
  React.useEffect(() => {
    if (props.linkLabel) {
      state.current!.linkLabel = props.linkLabel as LinkLabelFn
      return
    }
    state.current!.linkLabel = (...params: Parameters<LinkLabelFn>) => {
      const [link] = params
      return link?.id
    }
  }, [props.linkLabel])

  /** SET NODES AND LINKS */
  React.useEffect(() => {
    state.current.nodes = props.nodes
    const links = assignCurves(props.links)
    state.current.links = links
    //TODO: It's not good solution
    setTimeout(() => {
      zoomToFit(state)
    }, 80)
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
      drawAllNodes(state)
      if (
        state.current!.hoveredData.pointer?.x &&
        state.current!.hoveredData.pointer?.y
      ) {
        drawLinkTooltip(
          state,
          state.current!.hoveredData.pointer?.x,
          state.current!.hoveredData.pointer?.y,
        )
      }
      if (state.current.isLassoing) {
        drawLasso(state)
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

  const frameIdRef = React.useRef<number>()
  React.useEffect(() => {
    function animate() {
      requestRender()
      frameIdRef.current = requestAnimationFrame(animate)
    }
    frameIdRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [])

  useInitialize({
    state,
    isFixed: props.isFixed,
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
  })

  useZoom({
    state,
  })

  useHandlers({
    state,
    getPointerCoords,
    handleClick: handleClick as any,
  })

  useLasso({
    state,
    getPointerCoords,
  })

  return (
    <canvas
      id={props.id}
      ref={register('canvas')}
      width={sizes.width}
      height={sizes.height}
    />
  )
}

export const Graph = React.forwardRef(GraphComponent) as <
  TLink extends {},
  TNode extends {},
>(
  props: GraphProps<TNode, TLink> & {
    ref?: React.ForwardedRef<GraphRef>
  },
) => ReturnType<typeof GraphComponent>
