import React from 'react'

import { Graph } from 'react-graph-ts'
import type { LinkType, NodeType } from 'react-graph-ts'

function createRandomGraph(
  nodeCount: number,
  desiredLinks: number = 6000,
  maxLinksPerPair: number = 5,
) {
  const nodes: NodeType[] = []
  const links: LinkType[] = []

  // --- create nodes ---
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: `N${i}` })
  }

  let linkId = 1

  // --- generate links until we reach the target count ---
  while (links.length < desiredLinks) {
    const i = Math.floor(Math.random() * nodeCount)
    const j = Math.floor(Math.random() * nodeCount)

    if (i === j) continue // skip self-links

    const source = nodes[i].id
    const target = nodes[j].id

    // number of parallel links between this pair
    const count = Math.ceil(Math.random() * maxLinksPerPair)

    for (let k = 0; k < count && links.length < desiredLinks; k++) {
      links.push({
        id: `${linkId++}`,
        source,
        target,
      })
    }
  }

  return { nodes, links }
}

export default function App() {
  const [nodeCount, setNodeCount] = React.useState(1000)
  const [linkCount, setLinkCount] = React.useState(3000)
  const [isFixed, setIsFixed] = React.useState(false)

  const [colors, setColors] = React.useState({
    background: '#2d313a',
    // background: '#bbbfca',

    node: '#4b5bbe',
    nodeHover: '#ec69b3',
    nodeActive: '#DDB67D',

    link: '#5F74C2',
    linkHover: '#ec69b3',
    linkActive: '#DDB67D',

    nodeLabel: '#D9DBE0',

    particles: '#ff1974',
  })

  const [settings, setSettings] = React.useState({
    linkDistance: 100,
    linkStrength: 0.7,

    nodeRadius: 8,
    hoveredBorder: 4,

    alphaDecay: 0.05,

    isFixed: false,
    isFixedNodeAfterDrag: true,

    //Particles of link
    particlesSpeed: 0.015,
    particlesSize: 3,
    withParticles: true,

    isDashed: false,
    withNodeLabels: false,
    // linkWidth: 1.5,
    // linkDistance: 80,
    // repulsion: -50,
    // showLabels: false,
    // directed: false,
  })

  const { nodes, links } = React.useMemo(() => {
    const { nodes, links } = createRandomGraph(nodeCount, linkCount)
    return { nodes, links }
  }, [nodeCount, linkCount])

  // const [isFixed, setIsFixed] = React.useState(false)
  // const [_nodes, setNodes] = React.useState(nodes)
  // const [_links, setLinks] = React.useState(links)
  // const [colors, setColors] = React.useState({})
  // const [search, setSearch] = React.useState('')

  // function handleCreateNodes() {
  //   const { nodes, links } = createRandomGraph(50, 150)
  //   setNodes(nodes)
  //   setLinks(links)
  // }

  // function handleChangeColor() {
  //   setColors({
  //     background: '#fff',

  //     node: '#be924b',
  //   })
  // }

  // function handleSelectedNode(nodes) {
  //   console.log(nodes)
  // }

  // const visibleNodes = React.useMemo(() => {
  //   if (!search) return nodes
  //   return _nodes.filter((node) => {
  //     return node.id.includes(search)
  //   })
  // }, [search, _nodes])

  // const visibleLinks = React.useMemo(() => {
  //   const nodesById = visibleNodes.reduce(
  //     (acc, node) => {
  //       acc[node.id] = node
  //       return acc
  //     },
  //     {} as Record<string, NodeType>,
  //   )
  //   return _links.reduce((acc, link) => {
  //     const source =
  //       typeof link.source === 'string'
  //         ? nodesById[link.source]
  //         : nodesById[link.source.id]
  //     const target =
  //       typeof link.target === 'string'
  //         ? nodesById[link.target]
  //         : nodesById[link.target.id]
  //     if (!source || !target) {
  //       return acc
  //     }
  //     link.source = source
  //     link.target = target
  //     acc.push(link)
  //     return acc
  //   }, [])
  // }, [_links, visibleNodes])

  return (
    <div className="w-full h-full flex gap-4 bg-black p-4">
      {/* --- CONTROL PANEL --- */}
      <div className="bg-[#1c2029] rounded-2xl p-6 shadow-md">
        <h2 className="text-xl text-white font-semibold mb-4">
          Graph Controls
        </h2>

        {/* Node Count */}
        <label className="block text-sm text-[#bbbfca]">Nodes</label>
        <input
          type="number"
          className="w-full p-2 rounded-md border mb-3 text-white"
          value={nodeCount}
          min={1}
          max={2000}
          onChange={(e) => setNodeCount(Number(e.target.value))}
        />

        {/* Link Count */}
        <label className="block text-sm text-[#bbbfca]">Links</label>
        <input
          type="number"
          className="w-full p-2 rounded-md border mb-3 text-white"
          value={linkCount}
          min={0}
          max={5000}
          onChange={(e) => setLinkCount(Number(e.target.value))}
        />

        {/* Node Size */}
        <label className="block text-sm text-[#bbbfca]">
          Node Size ({settings.nodeRadius})
        </label>
        <input
          type="range"
          min={2}
          max={40}
          value={settings.nodeRadius}
          onChange={(e) =>
            setSettings({ ...settings, nodeRadius: Number(e.target.value) })
          }
          className="w-full mb-3"
        />

        {/* Link Width
        <label className="block text-sm text-slate-600">
          Link Width ({settings.linkWidth})
        </label>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={settings.linkWidth}
          onChange={(e) =>
            setSettings({ ...settings, linkWidth: Number(e.target.value) })
          }
          className="w-full mb-3"
        />

        // Link Distance 
        <label className="block text-sm text-slate-600">
          Link Distance ({settings.linkDistance})
        </label>
        <input
          type="range"
          min={20}
          max={200}
          value={settings.linkDistance}
          onChange={(e) =>
            setSettings({ ...settings, linkDistance: Number(e.target.value) })
          }
          className="w-full mb-3"
        />

         // Repulsion
        <label className="block text-sm text-slate-600">
          Repulsion ({settings.repulsion})
        </label>
        <input
          type="range"
          min={-300}
          max={100}
          value={settings.repulsion}
          onChange={(e) =>
            setSettings({ ...settings, repulsion: Number(e.target.value) })
          }
          className="w-full mb-3"
        /> */}

        {/* Colors */}
        <div className="mb-3">
          <label className="block text-sm text-[#bbbfca] mb-1">
            Node Color
          </label>
          <input
            type="color"
            value={colors.node}
            onChange={(e) => setColors({ ...colors, node: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-[#bbbfca] mb-1">
            Link Color
          </label>
          <input
            type="color"
            value={colors.link}
            onChange={(e) => setColors({ ...colors, link: e.target.value })}
          />
        </div>

        {/* Toggles */}
        <label className="flex items-center gap-2 mb-2 text-sm text-[#bbbfca]">
          <input
            type="checkbox"
            checked={settings.withNodeLabels}
            onChange={(e) =>
              setSettings({ ...settings, withNodeLabels: e.target.checked })
            }
          />
          Show Labels
        </label>

        {/* <label className="flex items-center gap-2 mb-2 text-sm">
          <input
            type="checkbox"
            checked={settings.directed}
            onChange={(e) =>
              setSettings({ ...settings, directed: e.target.checked })
            }
          />
          Directed Graph
        </label> */}

        <label className="flex items-center gap-2 mb-2 text-sm text-[#bbbfca]">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
          />
          Fix Nodes
        </label>
      </div>

      {/* --- GRAPH PANEL --- */}
      <div className="w-full flex bg-[#1c2029] rounded-2xl p-4 shadow-md">
        <h2 className="text-lg text-white font-semibold mb-3">Graph Preview</h2>

        <div className="w-full h-full rounded-lg overflow-hidden">
          <Graph
            nodes={nodes}
            links={links}
            isFixed={isFixed}
            colors={colors}
            settings={settings}
            // onSelectedNode={handleSelectedNode}
          />
        </div>
      </div>
    </div>
  )
}
