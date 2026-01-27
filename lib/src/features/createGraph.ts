import { getState, INITIAL_STATE } from '../state'
import { ExternalState } from '../typings/state'

import { DeepKey, DeepValue } from '../typings/utils'
import { handleDrag } from './drag'
import { engine } from './engine'
import { updateExternalParam } from './externalParams'
import { handleHandlers } from './handlers'
import { handleLasso } from './lasso'
import { handleSimulation } from './simulation'
import { handleZoom } from './zoom'

export type CreateGraphParams<TNode extends object, TLink extends object> = {
  id: string
  initialState?: Partial<ExternalState<TNode, TLink>>
}

export function createGraph<TNode extends object, TLink extends object>(
  params: CreateGraphParams<TNode, TLink>,
) {
  const state = getState<TNode, TLink>(params.initialState)

  //TODO: Mb move from here
  function _getPointerCoords(clientX: number, clientY: number) {
    const rect = state.canvas!.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return state.transform.invert([x, y])
  }

  //TODO: Mb move from here
  function _setIsGraphChange(isChanged: boolean) {
    state.isGraphChanged = isChanged
  }

  function _startHandlers() {
    state.unSubscribeFeatures.handleSimulation = handleSimulation({
      state,
      setIsGraphChange: _setIsGraphChange,
    })

    state.unSubscribeFeatures.engine = engine(state)
    state.unSubscribeFeatures.handleDrag = handleDrag({
      state,
      setIsGraphChange: _setIsGraphChange,
      getPointerCoords: _getPointerCoords,
    })

    state.unSubscribeFeatures.handleZoom = handleZoom({ state })
    state.unSubscribeFeatures.handleHandlers = handleHandlers({
      state,
      getPointerCoords: _getPointerCoords,
    })
    state.unSubscribeFeatures.handleLasso = handleLasso({
      state,
      getPointerCoords: _getPointerCoords,
    })
  }

  function _initializeExternalHandlers() {
    Object.entries({
      ...state.externalState.handlers,
      ...INITIAL_STATE.externalState.handlers,
    }).forEach(([key, value]) => {
      updateExternalParam(
        state,
        `handlers.${key as keyof typeof state.externalState.handlers}`,
        value,
        _startHandlers,
      )
    })
  }

  function updater<K extends DeepKey<ExternalState>>(
    key: K,
    value: DeepValue<ExternalState, K>,
  ) {
    if (!key) return
    updateExternalParam(state, key, value, _startHandlers)
  }

  function start() {
    const canvas = document.getElementById(
      params.id,
    ) as HTMLCanvasElement | null

    if (!canvas) {
      console.error("canvas doesn't find by id: " + params.id)
      return
    }

    const context = canvas.getContext('2d')
    state.canvas = canvas
    state.context = context

    _initializeExternalHandlers()
    _startHandlers()
  }

  function unSubscribe() {
    Object.values(state.unSubscribeFeatures).forEach((feature) => {
      feature()
    })
  }

  return {
    updater,
    start,
    unSubscribe,
  }
}
