import React from 'react'
import { quadtree } from 'd3'

import {
  Colors,
  LinkColorFn,
  DetectNodeColorFn,
  NodeLabelFn,
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
  assignCurves,
  buildLinkGrid,
  centerAt,
  zoom,
  zoomToFit,
} from './helpers'
import { useRefManager } from './state'

import { useDrag } from './features/useDrag'
import { useZoom } from './features/useZoom'
import { useLasso } from './features/useLasso'
import { useEngine } from './features/useEngine'
import { useHandlers } from './features/useHandlers'
import { useInitialize } from './features/useInitialize'

export type GraphProps<TLink extends {}, TNode extends {}> = {
  id?: string
  isFixed?: boolean
  settings?: Partial<Settings>
  onClick?: OnClickFn<TNode, TLink>
  //LINKS
  links: LinkType<TLink>[]
  colors?: Partial<Colors>
  linkColor?: LinkColorFn<TLink>
  linkLabel?: LinkLabelFn<TLink>
  //NODES
  nodes: NodeType<TNode>[]
  nodeLabel?: NodeLabelFn<TNode>
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
    zoom: (scale: number, duration?: number) => {
      zoom(state, scale, duration)
    },
    centerAt: (x: number, y: number, duration?: number) => {
      centerAt(state, x, y, duration)
    },
  }))

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

  /** SET FUNCTIONS */
  React.useEffect(() => {
    if (props.nodeLabel) {
      state.current!.nodeLabel = props.nodeLabel as NodeLabelFn
      return
    }
    state.current!.nodeLabel = (...params: Parameters<NodeLabelFn>) => {
      const [node] = params
      return node?.id
    }
  }, [props.nodeLabel])
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
    if (props.onClick) {
      state.current!.onClick = props.onClick as OnClickFn
    }
  }, [props.onClick])
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

  function getPointerCoords(clientX: number, clientY: number) {
    const rect = state.current.canvas!.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return state.current.transform.invert([x, y])
  }

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

        state.current.width = width
        state.current.height = height
        setSizes({
          width,
          height,
        })
      })

      resizeObserver.observe(document.body)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  useEngine(state)

  useInitialize({
    state,
    isFixed: props.isFixed,
    updateCache,
    nodes: props.nodes as any,
    links: props.links as any,
    settings: props.settings,
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
