import * as d3 from 'd3'

export function createD3CanvasGraph(
  div: any,
  // canvas: HTMLCanvasElement,
  nodes: any,
  links: any,
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1

  const width = div.clientWidth * dpr
  const height = div.clientHeight * dpr
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'flex'
  div.appendChild(canvas)

  canvas.width = width
  canvas.height = height

  // Camera transform for zoom/pan
  let transform = d3.zoomIdentity

  // ---- Force Simulation ----
  const simulation = d3
    .forceSimulation(nodes.current)
    .force(
      'link',
      d3
        .forceLink(links.current)
        .id((d: any) => d.id)
        .distance(1000)
        .strength(0.5),
    )
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', draw)
    .alphaDecay(0.9)
  // .on('end', () => {
  //   // if (props.isFixed) {
  //   nodes.current.forEach((node) => {
  //     node.fx = node.x
  //     node.fy = node.y
  //   })
  //   // }
  // }) // redraw every tick

  // ---- Dragging ----
  const drag = d3
    .drag<HTMLCanvasElement, any>()
    .subject((event) => {
      const [x, y] = transform.invert([event.x, event.y])
      console.log('find node')
      return findNode(x, y)
    })
    .on('start', (event) => {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    })
    .on('drag', (event) => {
      const [x, y] = transform.invert([event.x, event.y])
      event.subject.fx = x
      event.subject.fy = y
    })
    .on('end', (event) => {
      if (!event.active) simulation.alphaTarget(0)
      // event.subject.fx = null;
      // event.subject.fy = null;
    })

  d3.select(canvas).call(drag as any)

  // ---- Zoom + Pan ----
  const zoom = d3
    .zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.1, 6])
    .on('zoom', (event) => {
      transform = event.transform
      draw()
    })

  d3.select(canvas).call(zoom as any)

  // ---- Node hit test ----
  function findNode(x: number, y: number) {
    return nodes.current.find((n) => Math.hypot(n.x - x, n.y - y) < 10)
  }

  // ---- Draw everything ----
  function draw() {
    console.log('draw')
    ctx.save()
    ctx.clearRect(0, 0, width, height)

    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.k, transform.k)

    // Links
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 1.5
    links.current.forEach((l) => {
      ctx.beginPath()
      ctx.moveTo(l.source.x, l.source.y)
      ctx.lineTo(l.target.x, l.target.y)
      ctx.stroke()
    })

    // Nodes
    ctx.fillStyle = '#1f77b4'
    nodes.current.forEach((n) => {
      ctx.beginPath()
      ctx.arc(n.x, n.y, 7, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()
  }

  draw()

  return { simulation }
}
