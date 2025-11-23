import React from 'react'

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  zoomIdentity,
  Quadtree,
  quadtree,
} from 'd3'
import { HoveredData, LinkType, NodeType } from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'
import { useHandlers } from './features/handlers'
import { useRefManager } from './state'

export type GraphProps = {
  nodes: NodeType[]
  links: LinkType[]
  isFixed: boolean
}

const BACKGROUND = 'grey'

const LINK_DISTANCE = 100
const LINK_STRENGTH = 0.4

const NODE_RADIUS = 10

const WIDTH = 1200
const HEIGHT = 800

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

export function Graph(props: GraphProps) {
  const { refs: state, register } = useRefManager()
  // const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  // const contextRef = React.useRef<CanvasRenderingContext2D | null>(null)

  // const nodesRef = React.useRef<NodeType[]>([])
  // const nodesCacheRef = React.useRef<Quadtree<NodeType> | null>(null)
  // const linksRef = React.useRef<LinkType[]>([])
  // const linksGridRef = React.useRef<Map<string, LinkType[]>>(new Map())

  // const isRequestRendering = React.useRef(false)

  // const hoveredData = React.useRef<HoveredData>({
  //   link: null,
  //   node: null,
  // })

  // const simulationEngineRef = React.useRef<d3.Simulation<
  //   NodeType,
  //   undefined
  // > | null>(null)

  // const transformRef = React.useRef(zoomIdentity)
  // //drag and zoom, mb rename like isProcess
  // const isDraggingRef = React.useRef(false)

  const alphaDecay = props.isFixed ? FIXED_ALPHA_DECAY : ALPHA_DECAY

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
    context.fillStyle = BACKGROUND
    context.fillRect(0, 0, WIDTH, HEIGHT)
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
    // return { grid, cellSize }
  }, [])

  function findNode(x: number, y: number) {
    return state.current.nodes.find(
      (n) => Math.hypot(n.x! - x, n.y! - y) < NODE_RADIUS,
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
      drawAllNodes(state, NODE_RADIUS)
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

  /** INITIALIZE */
  React.useEffect(() => {
    const canvas = state.current.canvas!
    const context = canvas.getContext('2d')!
    state.current.context = context
    let tickCounter = 0

    state.current.simulationEngine = forceSimulation(state.current.nodes)
      .force(
        'link',
        forceLink(state.current.links)
          .id((d) => (d as { id: string }).id)
          .distance(LINK_DISTANCE)
          .strength(LINK_STRENGTH),
      )
      .force('charge', forceManyBody().strength(-100))
      //TODO: Add width and height from parent
      .force('center', forceCenter(WIDTH / 2, HEIGHT / 2))
      .alphaDecay(alphaDecay)
      .on('tick', () => {
        requestRender()
        tickCounter++
        if (tickCounter % 6 === 0) {
          updateNodesCache()
          buildLinkGrid()
        }
      })
      .on('end', () => {
        if (props.isFixed) {
          state.current.nodes.forEach((node) => {
            node.fx = node.x
            node.fy = node.y
          })
        }
        updateNodesCache()
        buildLinkGrid()
      })
  }, [requestRender, buildLinkGrid, alphaDecay, props.isFixed])

  const updateNodesCache = React.useCallback(function updateNodesCache() {
    state.current.nodesCache = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(state.current.nodes)
  }, [])

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
    nodeRadius: NODE_RADIUS,
    draw: requestRender,
    getPointerCoords,
  })

  return <canvas ref={register('canvas')} width={WIDTH} height={HEIGHT} />
}
