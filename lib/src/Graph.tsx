import React from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  zoomIdentity,
} from 'd3'
import { LinkType, NodeType } from './typings'
import { drawAllLinks, drawAllNodes } from './features/draw'
import { useDrag } from './features/drag'
import { useZoom } from './features/zoom'

export type GraphProps = {
  nodes: NodeType[]
  links: LinkType[]
  isFixed: boolean
}

const BACKGROUND = 'grey'

const LINK_DISTANCE = 200
const LINK_STRENGTH = 0.8

const NODE_RADIUS = 10

const WIDTH = 1200
const HEIGHT = 800

const ALPHA_DECAY = 0.05
const FIXED_ALPHA_DECAY = 0.6

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

  const transformRef = React.useRef(zoomIdentity)

  const alphaDecay = props.isFixed ? FIXED_ALPHA_DECAY : ALPHA_DECAY

  /** SET NODES AND LINKS */
  React.useEffect(() => {
    nodesRef.current = JSON.parse(JSON.stringify(props.nodes))
    linksRef.current = JSON.parse(JSON.stringify(props.links))
  }, [props.nodes, props.links])

  const clearCanvas = React.useCallback(function clearCanvas() {
  // context: CanvasRenderingContext2D,
    contextRef.current!.save()
    contextRef.current!.setTransform(1, 0, 0, 1, 0, 0)
    contextRef.current!.fillStyle = BACKGROUND
    contextRef.current!.fillRect(0, 0, WIDTH, HEIGHT)
    contextRef.current!.restore()
  }, [])

  const draw = React.useCallback(
    function draw() {
      if (!contextRef.current) return
      clearCanvas()
      // console.log(transformRef.current)
      // const dpr = window.devicePixelRatio || 1
      contextRef.current?.setTransform(
        transformRef.current.k,
        0,
        0,
        transformRef.current.k,
        transformRef.current.x,
        transformRef.current.y,
      )
      // contextRef.current.translate(
      //   transformRef.current.x,
      //   transformRef.current.y,
      // )
      // contextRef.current.scale(transformRef.current.k, transformRef.current.k)
      // console.log('final ctx transform =', contextRef.current.getTransform())

      drawAllLinks(contextRef.current, linksRef.current)
      drawAllNodes(
        contextRef.current,
        transformRef.current,
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
    // console.log('f')
    simulationEngineRef.current = forceSimulation(nodesRef.current)
      .force(
        'link',
        forceLink(linksRef.current)
          .id((d) => (d as { id: string }).id)
          .distance(LINK_DISTANCE)
          .strength(LINK_STRENGTH),
      )
      .force('charge', forceManyBody().strength(-600))
      //TODO: Add width and height from parent
      .force('center', forceCenter(WIDTH / 2, HEIGHT / 2))
      .alphaDecay(alphaDecay)
      .on('tick', () => {
        // console.log('draw?')
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
  }, [requestRender, alphaDecay, props.isFixed])

  useDrag({
    canvas: canvasRef,
    nodes: nodesRef,
    draw: requestRender,
    nodeRadius: NODE_RADIUS,
    simulationRef: simulationEngineRef,
    alphaDecay,
    transformRef,
    isFixed: props.isFixed,
  })

  useZoom({
    canvasRef,
    transformRef,
    contextRef,
    draw: requestRender,
  })

  return <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
}
