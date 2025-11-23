import React from 'react'

import { quadtree } from 'd3'
import { LinkType, NodeType } from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'
import { useInitialize } from './features/initialize'

export type GraphProps = {
  nodes: NodeType[]
  links: LinkType[]
  isFixed: boolean
}

export function Graph(props: GraphProps) {
  const { refs: state, register } = useRefManager()

  const alphaDecay = props.isFixed
    ? state.current.settings.fixedAlphaDecay
    : state.current.settings.alphaDecay

  /** SET NODES AND LINKS */
  React.useEffect(() => {
    state.current.nodes = JSON.parse(JSON.stringify(props.nodes))
    state.current.links = JSON.parse(JSON.stringify(props.links))
  }, [props.nodes, props.links])

  const clearCanvas = React.useCallback(function clearCanvas(
    context: CanvasRenderingContext2D,
  ) {
    context.save()
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.fillStyle = state.current.settings.background
    context.fillRect(
      0,
      0,
      state.current.settings.width,
      state.current.settings.height,
    )
    context.restore()
  }, [])

  //link cellSize = link length * 0.6
  const buildLinkGrid = React.useCallback(function buildLinkGrid() {
    const cellSize = 150
    const grid = new Map<string, LinkType[]>()

    function key(cx: number, cy: number) {
      return `${cx},${cy}`
    }

    for (const link of state.current.links) {
      const source = link.source as unknown as NodeType
      const target = link.target as unknown as NodeType

      if (source.x && source.y && target.x && target.y) {
        const minX = Math.min(source.x, target.x)
        const maxX = Math.max(source.x, target.x)
        const minY = Math.min(source.y, target.y)
        const maxY = Math.max(source.y, target.y)

        const startX = Math.floor(minX / cellSize)
        const endX = Math.floor(maxX / cellSize)
        const startY = Math.floor(minY / cellSize)
        const endY = Math.floor(maxY / cellSize)

        for (let cx = startX; cx <= endX; cx++) {
          for (let cy = startY; cy <= endY; cy++) {
            const k = key(cx, cy)
            if (!grid.has(k)) grid.set(k, [])
            grid.get(k)!.push(link)
          }
        }
      }
    }

    state.current.linksGrid = grid
  }, [])

  function findNode(x: number, y: number) {
    return state.current.nodes.find(
      (n) => Math.hypot(n.x! - x, n.y! - y) < state.current.settings.nodeRadius,
    )
  }

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
      drawAllNodes(state, state.current.settings.nodeRadius)
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

  const updateNodesCache = React.useCallback(function updateNodesCache() {
    state.current.nodesCache = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(state.current.nodes)
  }, [])

  const updateCache = React.useCallback(
    function updateCache() {
      updateNodesCache()
      buildLinkGrid()
    },
    [updateNodesCache, buildLinkGrid],
  )

  useInitialize({
    state,
    isFixed: props.isFixed,
    alphaDecay,
    draw: requestRender,
    updateCache,
  })

  useDrag({
    state,
    alphaDecay,
    isFixed: props.isFixed,
    findNode,
    buildLinkGrid,
    getPointerCoords,
    updateNodesCache,
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
  })

  return (
    <canvas
      ref={register('canvas')}
      width={state.current.settings.width}
      height={state.current.settings.height}
    />
  )
}
