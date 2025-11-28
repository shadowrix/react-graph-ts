import React from 'react'

import { Graph } from 'react-graph-ts'
import type { LinkType, NodeType } from 'react-graph-ts'
import { Field } from './components/custom-ui/Field'
import { Checkbox } from './components/ui/checkbox'
import { Label } from './components/ui/label'
import { Separator } from './components/ui/separator'

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
      <div className="w-[250px] bg-[#1c2029] rounded-2xl p-6 shadow-md">
        <h2 className="text-xl text-white font-semibold mb-4">
          Graph Controls
        </h2>

        <div className="flex flex-col gap-1">
          <Field label="Nodes">
            <input
              type="number"
              className="w-full p-2 rounded-md border mb-3 text-white"
              value={nodeCount}
              min={1}
              max={2000}
              onChange={(e) => setNodeCount(Number(e.target.value))}
            />
          </Field>
          <Field label="Links">
            <input
              type="number"
              className="w-full p-2 rounded-md border mb-3 text-white"
              value={linkCount}
              min={0}
              max={5000}
              onChange={(e) => setLinkCount(Number(e.target.value))}
            />
          </Field>
          <Field label={`Node Size (${settings.nodeRadius})`}>
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
          </Field>
          <div className="flex flex-col gap-3 mt-3">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-[#bbbfca]">Colors</div>
              <Separator orientation="horizontal" />
            </div>
            <div className="flex gap-3">
              <Field label="Node">
                <input
                  type="color"
                  value={colors.node}
                  onChange={(e) =>
                    setColors({ ...colors, node: e.target.value })
                  }
                />
              </Field>
              <Field label="Link">
                <input
                  type="color"
                  value={colors.link}
                  onChange={(e) =>
                    setColors({ ...colors, link: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="flex flex-col gap-5 mt-3">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-[#bbbfca]">Settings</div>
              <Separator orientation="horizontal" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Checkbox
                  id="withNodeLabels"
                  checked={settings.withNodeLabels}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      withNodeLabels: !settings.withNodeLabels,
                    })
                  }
                />
                <Label htmlFor="withNodeLabels">Show Labels</Label>
              </div>
              <div className="flex gap-2">
                <Checkbox
                  id="isFixed"
                  checked={isFixed}
                  onClick={() => setIsFixed((prev) => !prev)}
                />
                <Label htmlFor="isFixed">Fix Nodes</Label>
              </div>
              <div className="flex gap-2">
                <Checkbox
                  id="isFixedNodeAfterDrag"
                  checked={settings.isFixedNodeAfterDrag}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      isFixedNodeAfterDrag: !settings.isFixedNodeAfterDrag,
                    })
                  }
                />
                <Label htmlFor="isFixedNodeAfterDrag">
                  Fix node after drag
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRAPH PANEL --- */}
      <div className="w-full flex bg-[#1c2029] rounded-2xl p-4 shadow-md">
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
