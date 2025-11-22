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
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null)

  const nodesRef = React.useRef<NodeType[]>([])
  const nodesCacheRef = React.useRef<Quadtree<NodeType> | null>(null)
  const linksRef = React.useRef<LinkType[]>([])

  const isRequestRendering = React.useRef(false)

  const hoveredData = React.useRef<HoveredData>({
    link: null,
    node: null,
  })

  const simulationEngineRef = React.useRef<d3.Simulation<
    NodeType,
    undefined
  > | null>(null)

  const transformRef = React.useRef(zoomIdentity)

  const alphaDecay = props.isFixed ? FIXED_ALPHA_DECAY : ALPHA_DECAY

  /** SET NODES AND LINKS */
  React.useEffect(() => {
    nodesRef.current = JSON.parse(JSON.stringify(props.nodes))
    linksRef.current = JSON.parse(JSON.stringify(props.links))
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

  function findNode(x: number, y: number) {
    return nodesRef.current.find(
      (n) => Math.hypot(n.x! - x, n.y! - y) < NODE_RADIUS,
    )
  }

  function getPointerCoords(clientX: number, clientY: number) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    return transformRef.current.invert([x, y])
  }

  const draw = React.useCallback(
    function draw() {
      console.log('draw?')
      if (!contextRef.current) return
      clearCanvas(contextRef.current)
      contextRef.current?.setTransform(
        transformRef.current.k,
        0,
        0,
        transformRef.current.k,
        transformRef.current.x,
        transformRef.current.y,
      )

      drawAllLinks(contextRef.current, linksRef.current)
      drawAllNodes(
        contextRef.current,
        hoveredData,
        nodesRef.current,
        NODE_RADIUS,
      )
    },
    [clearCanvas],
  )

  const requestRender = React.useCallback(
    function requestRender() {
      if (isRequestRendering.current) return
      isRequestRendering.current = true
      requestAnimationFrame(() => {
        isRequestRendering.current = false
        draw()
      })
    },
    [draw],
  )

  /** INITIALIZE */
  React.useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    contextRef.current = context
    let tickCounter = 0

    simulationEngineRef.current = forceSimulation(nodesRef.current)
      .force(
        'link',
        forceLink(linksRef.current)
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
        }
      })
      .on('end', () => {
        if (props.isFixed) {
          nodesRef.current.forEach((node) => {
            node.fx = node.x
            node.fy = node.y
          })
        }
        updateNodesCache()
      })
  }, [requestRender, alphaDecay, props.isFixed])

  const updateNodesCache = React.useCallback(function updateNodesCache() {
    nodesCacheRef.current = quadtree<NodeType>()
      .x((d) => d.x!)
      .y((d) => d.y!)
      .addAll(nodesRef.current)
  }, [])

  useDrag({
    findNode,
    getPointerCoords,
    updateNodesCache,
    draw: requestRender,
    alphaDecay,
    transformRef,
    nodes: nodesRef,
    canvas: canvasRef,
    isFixed: props.isFixed,
    nodeRadius: NODE_RADIUS,
    simulationRef: simulationEngineRef,
  })

  useZoom({
    canvasRef,
    transformRef,
    draw: requestRender,
  })

  useHandlers({
    canvasRef,
    nodesRef,
    nodeRadius: NODE_RADIUS,
    nodesCacheRef,
    hoveredData,
    transformRef,
    draw: requestRender,
    getPointerCoords,
  })

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
}
