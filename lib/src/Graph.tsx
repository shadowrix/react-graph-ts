import React from 'react'

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
import { assignCurves, centerAt, zoom, zoomToFit } from './helpers'
import { useRefManager } from './state'

import { useDrag } from './features/useDrag'
import { useZoom } from './features/useZoom'
import { useLasso } from './features/useLasso'
import { useEngine } from './features/useEngine'
import { useHandlers } from './features/useHandlers'
import { useInitialize } from './features/useInitialize'
import { useHandleGraphApi } from './features/useHandleGraphApi'

export type GraphProps<TNode extends {}, TLink extends {}> = {
  id?: string
  isFixed?: boolean
  settings?: Partial<Settings>
  onClick?: OnClickFn<TNode, TLink>

  //LINKS
  links: LinkType<TLink, TNode>[]
  colors?: Partial<Colors>
  linkColor?: LinkColorFn<TLink, TNode>
  linkLabel?: LinkLabelFn<TLink, TNode>
  //NODES
  nodes: NodeType<TNode>[]
  nodeLabel?: NodeLabelFn<TNode>
  nodeColor?: DetectNodeColorFn<TNode>
  onSelectedNode?: OnSelectedNodesFn<TNode>
  drawNode?: DrawNodeFn<TNode>
}

function GraphComponent<TNode extends {}, TLink extends {}>(
  props: GraphProps<TNode, TLink>,
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
    centerAt: (x: number, y: number, transform?: number, duration?: number) => {
      centerAt(state, x, y, transform, duration)
    },
  }))

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

  function setIsGraphChange(isChanged: boolean) {
    state.current.isGraphChanged = isChanged
  }

  useHandleGraphApi(state, props)

  useInitialize({
    state,
    isFixed: props.isFixed,
    setIsGraphChange,
    nodes: props.nodes as any,
    links: props.links as any,
    settings: props.settings,
    sizes,
  })

  useEngine(state)

  useDrag({
    state,
    setIsGraphChange,
    getPointerCoords,
  })

  useZoom({ state })

  useHandlers({ state, getPointerCoords })

  useLasso({ state, getPointerCoords })

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
  TNode extends {} = {},
  TLink extends {} = {},
>(
  props: GraphProps<TNode, TLink> & {
    ref?: React.ForwardedRef<GraphRef>
  },
) => ReturnType<typeof GraphComponent>
