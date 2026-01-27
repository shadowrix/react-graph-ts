import React from 'react'

import {
  LinkColorFn,
  DetectNodeColorFn,
  NodeLabelFn,
  LinkType,
  NodeType,
  OnClickFn,
  LinkLabelFn,
  GraphRef,
  OnSelectedNodesFn,
  DrawNodeFn,
  UpdaterFn,
} from './typings'
import { createGraph } from './features/createGraph'
import { Colors, Settings } from './typings/state'

export type GraphProps<TNode extends object, TLink extends object> = {
  id: string
  // isFixed?: boolean
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

function GraphComponent<TNode extends object, TLink extends object>(
  props: GraphProps<TNode, TLink>,
  // ref: React.ForwardedRef<GraphRef>,
) {
  const graphRef = React.useRef<HTMLCanvasElement | null>(null)
  const [updater, setUpdater] = React.useState<UpdaterFn>()
  // const { refs: state, register } = useRefManager()
  const [sizes, setSizes] = React.useState({
    width: 0,
    height: 0,
  })

  // React.useImperativeHandle(ref, () => ({
  //   getPointerCoords(x, y) {
  //     return getPointerCoords(x, y)
  //   },
  //   zoom: (scale: number, duration?: number) => {
  //     zoom(state, scale, duration)
  //   },
  //   centerAt: (x: number, y: number, transform?: number, duration?: number) => {
  //     centerAt(state, x, y, transform, duration)
  //   },
  // }))

  React.useEffect(() => {
    const graphApi = createGraph<TNode, TLink>({
      id: props.id,
      initialState: {
        colors: props.colors,
        settings: props.settings,
        handlers: {
          onClick: props.onClick,
          onSelectedNode: props.onSelectedNode,

          nodeLabel: props.nodeLabel,
          nodeColor: props.nodeColor,
          linkColor: props.linkColor,
          linkLabel: props.linkLabel,
          drawNode: props.drawNode,
        },
      },
    })
    graphApi.start()
    setUpdater(() => graphApi.updater)
    return () => {
      graphApi.unSubscribe()
    }
  }, [])

  React.useEffect(() => {
    updater?.('nodes', props.nodes)
  }, [updater, props.nodes])

  React.useEffect(() => {
    updater?.('links', props.links)
  }, [updater, props.links])

  React.useEffect(() => {
    updater?.('colors', props.colors ?? {})
  }, [updater, props.colors])

  React.useEffect(() => {
    updater?.('settings', props.settings ?? {})
  }, [updater, props.settings])

  /** SIZES */
  React.useEffect(() => {
    if (graphRef.current?.parentElement) {
      const resizeObserver = new ResizeObserver(() => {
        const width = graphRef.current!.parentElement!.clientWidth
        const height = graphRef.current!.parentElement!.clientHeight

        // state.current.width = width
        // state.current.height = height
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

  React.useEffect(() => {
    updater?.('width', sizes.width)
    updater?.('height', sizes.height)
  }, [updater, sizes])

  // console.log('state updater', updater)
  return (
    <canvas
      id={props.id}
      ref={graphRef}
      // ref={register('canvas')}
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
