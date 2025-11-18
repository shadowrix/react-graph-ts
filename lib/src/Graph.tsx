import React from 'react'
import * as d3 from 'd3'
import { LinkType, NodeType } from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'

export type GraphProps = {
  nodes: NodeType[]
  links: LinkType[]
  isFixed: boolean
}

const BACKGROUND = 'grey'

const LINK_DISTANCE = 100
const LINK_STRENGTH = 0.8
const NODE_RADIUS = 10

const WIDTH = 1200
const HEIGHT = 800

const ALPHA_DECAY = 0.03
const FIXED_ALPHA_DECAY = 0.2

export function Graph(props: GraphProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null)

  const nodesRef = React.useRef<NodeType[]>([])
  const linksRef = React.useRef<LinkType[]>([])

  const isRequestRendering = React.useRef(false)

  const simulationEngineRef = React.useRef<d3.Simulation<
    NodeType,
    undefined
  > | null>(null)

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

  const draw = React.useCallback(
    function draw() {
      if (!contextRef.current) return
      clearCanvas(contextRef.current)
      drawAllLinks(contextRef.current, linksRef.current)
      drawAllNodes(contextRef.current, nodesRef.current, NODE_RADIUS)
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

    simulationEngineRef.current = d3
      .forceSimulation(nodesRef.current)
      .force(
        'link',
        d3
          .forceLink(linksRef.current)
          .id((d) => (d as { id: string }).id)
          .distance(LINK_DISTANCE)
          .strength(LINK_STRENGTH),
      )
      .force('charge', d3.forceManyBody().strength(-350))
      //TODO: Добавить родительские ширину и высоту
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .alphaDecay(alphaDecay)
      .on('tick', () => {
        requestRender()
      })
      .on('end', () => {
        if (props.isFixed) {
          nodesRef.current.forEach((node) => {
            node.fx = node.x
            node.fy = node.y
          })
        }
      })
  }, [requestRender])

  useDrag({
    canvas: canvasRef,
    nodes: nodesRef,
    draw: requestRender,
    nodeRadius: NODE_RADIUS,
    simulationRef: simulationEngineRef,
    alphaDecay,
    isFixed: props.isFixed,
  })

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
}
