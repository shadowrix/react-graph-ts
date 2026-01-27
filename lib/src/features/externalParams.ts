import { INITIAL_STATE } from '../state'

import {
  DetectNodeColorFn,
  LinkColorFn,
  LinkLabelFn,
  NodeLabelFn,
} from '../typings'
import { DeepKey, DeepValue } from '../typings/utils'
import { Colors, ExternalState, State } from '../typings/state'
import { set } from '../helpers/set'

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

export function updateExternalParam<K extends DeepKey<ExternalState>>(
  state: State,
  key: K,
  value: DeepValue<ExternalState, K>,
  startHandlers: () => void,
) {
  switch (key) {
    case 'settings':
      if (typeof value !== 'object' || Array.isArray(value))
        return console.error("settings doesn't match the object type.")
      state.externalState.settings = {
        ...state.externalState.settings,
        ...(value ?? {}),
      }
      return
    case 'settings.isFixed':
      if (typeof value !== 'boolean')
        return console.error("settings.isFixed doesn't match the boolean type.")
      if (state?.externalState?.settings?.isFixed !== value && !value) {
        state?.externalState.nodes?.forEach((node) => {
          node.fx = undefined
          node.fy = undefined
        })
      } else {
        state.externalState.settings.isFixed = value ?? false
        state.externalState!.settings.alphaDecay = value
          ? FIXED_ALPHA_DECAY
          : ALPHA_DECAY
      }
      return
    case 'colors':
      if (typeof value !== 'object' || Array.isArray(value))
        return console.error("colors doesn't match the object type.")
      state.externalState.colors = {
        ...state.externalState.colors,
        ...((value as Colors) ?? {}),
      }
      return
    /** SET FUNCTIONS */
    case 'handlers.nodeLabel':
      if (typeof value !== 'function' && typeof value !== 'undefined')
        return console.error(
          "nodeLabel doesn't match the function or undefined type.",
        )
      if (value) {
        state.externalState!.handlers.nodeLabel = value as NodeLabelFn
      } else {
        state.externalState!.handlers.nodeLabel = (
          ...params: Parameters<NodeLabelFn>
        ) => {
          const [node] = params
          return node?.id
        }
      }
      return
    case 'handlers.nodeColor':
      if (typeof value !== 'function' && typeof value !== 'undefined')
        return console.error(
          "nodeColor doesn't match the function or undefined type.",
        )
      if (value) {
        state.externalState!.handlers.nodeColor = value as DetectNodeColorFn
      } else {
        state.externalState!.handlers.nodeColor = (
          ...params: Parameters<DetectNodeColorFn>
        ) => {
          const [_, isHover] = params
          if (isHover) {
            return (
              state.externalState!.colors.nodeHover ??
              INITIAL_STATE.externalState.colors.nodeHover!
            )
          }
          return (
            state.externalState!.colors.node ??
            INITIAL_STATE.externalState.colors.node!
          )
        }
      }
      return
    case 'handlers.linkColor':
      if (typeof value !== 'function' && typeof value !== 'undefined')
        return console.error(
          "linkColor doesn't match the function or undefined type.",
        )
      if (value) {
        state.externalState!.handlers.linkColor = value as LinkColorFn
        return
      }
      state.externalState.handlers.linkColor = (
        ...params: Parameters<LinkColorFn>
      ) => {
        const [link, isHover] = params
        if (isHover) {
          return (
            state.externalState.colors.linkHover ??
            INITIAL_STATE.externalState.colors.linkHover!
          )
        }
        return (
          link.settings?.color ??
          state.externalState.colors.link ??
          INITIAL_STATE.externalState.colors.link!
        )
      }
      return
    case 'handlers.linkLabel':
      if (typeof value !== 'function' && typeof value !== 'undefined')
        return console.error(
          "linkLabel doesn't match the function or undefined type.",
        )
      if (value) {
        state.externalState!.handlers.linkLabel = value as LinkLabelFn
        return
      }
      state.externalState.handlers.linkLabel = (
        ...params: Parameters<LinkLabelFn>
      ) => {
        const [link] = params
        return link?.id
      }
      return
    case 'handlers.onSelectedNode':
    case 'handlers.onClick':
    case 'handlers.drawNode':
      if (typeof value !== 'function' && typeof value !== 'undefined')
        return console.error(
          `${key} doesn't match the function or undefined type.`,
        )
      if (value) {
        set(state.externalState, key, value)
      }
      return
    case 'nodes':
    case 'links':
    case 'width':
    case 'height':
      set(state.externalState, key, value)
      startHandlers()
      return
    default:
      set(state.externalState, key, value)
      return
  }
}
