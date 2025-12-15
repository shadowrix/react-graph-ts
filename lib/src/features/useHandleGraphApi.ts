import React from 'react'
import { RefState } from '../state'
import { GraphProps } from '../Graph'
import {
  DetectNodeColorFn,
  DrawNodeFn,
  LinkColorFn,
  LinkLabelFn,
  NodeLabelFn,
  OnClickFn,
  OnSelectedNodesFn,
} from '../typings'

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

/**
 * - Set features from props of graph to state.
 * - Set settings and colors to state.
 */
export function useHandleGraphApi<TLink extends {}, TNode extends {}>(
  state: RefState,
  graphProps: GraphProps<TLink, TNode>,
) {
  React.useEffect(() => {
    if (
      state.current!.settings.isFixed !== graphProps.isFixed &&
      !graphProps.isFixed
    ) {
      state.current?.nodes?.forEach((node) => {
        node.fx = undefined
        node.fy = undefined
      })
    }
    state.current!.settings.isFixed = graphProps.isFixed ?? false
    state.current!.settings.alphaDecay = graphProps.isFixed
      ? FIXED_ALPHA_DECAY
      : ALPHA_DECAY
  }, [graphProps.isFixed])

  React.useEffect(() => {
    state.current!.colors = {
      ...state.current!.colors,
      ...(graphProps.colors ?? {}),
    }
  }, [graphProps.colors])

  React.useEffect(() => {
    state.current!.settings = {
      ...state.current!.settings,
      ...(graphProps.settings ?? {}),
    }
  }, [graphProps.settings])

  /** SET FUNCTIONS */
  React.useEffect(() => {
    if (graphProps.nodeLabel) {
      state.current!.nodeLabel = graphProps.nodeLabel as NodeLabelFn
      return
    }
    state.current!.nodeLabel = (...params: Parameters<NodeLabelFn>) => {
      const [node] = params
      return node?.id
    }
  }, [graphProps.nodeLabel])
  React.useEffect(() => {
    if (graphProps.nodeColor) {
      state.current!.nodeColor = graphProps.nodeColor as DetectNodeColorFn
      return
    }
    state.current!.nodeColor = (...params: Parameters<DetectNodeColorFn>) => {
      const [_, isHover] = params
      if (isHover) {
        return state.current!.colors.nodeHover
      }
      return state.current!.colors.node
    }
  }, [graphProps.nodeColor])
  React.useEffect(() => {
    if (graphProps.onSelectedNode) {
      state.current!.onSelectedNode =
        graphProps.onSelectedNode as OnSelectedNodesFn
    }
  }, [graphProps.onSelectedNode])
  React.useEffect(() => {
    if (graphProps.onClick) {
      state.current!.onClick = graphProps.onClick as OnClickFn
    }
  }, [graphProps.onClick])
  React.useEffect(() => {
    if (graphProps.drawNode) {
      state.current!.drawNode = graphProps.drawNode as DrawNodeFn
    }
  }, [graphProps.drawNode])
  React.useEffect(() => {
    if (graphProps.linkColor) {
      state.current!.linkColor = graphProps.linkColor as LinkColorFn
      return
    }
    state.current!.linkColor = (...params: Parameters<LinkColorFn>) => {
      const [link, isHover] = params
      if (isHover) {
        return state.current!.colors.linkHover
      }
      return link.settings?.color ?? state.current!.colors.link
    }
  }, [graphProps.linkColor])
  React.useEffect(() => {
    if (graphProps.linkLabel) {
      state.current!.linkLabel = graphProps.linkLabel as LinkLabelFn
      return
    }
    state.current!.linkLabel = (...params: Parameters<LinkLabelFn>) => {
      const [link] = params
      return link?.id
    }
  }, [graphProps.linkLabel])
}
