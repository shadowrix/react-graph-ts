import React from 'react'

import { Graph } from 'react-graph-ts'
import type { GraphRef, LinkType, NodeType } from 'react-graph-ts'
import { Field } from '../custom-ui/Field'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Block } from '../custom-ui/Block'
import { Select } from '../custom-ui/Select'

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

  let linkIndex = 1

  const maxNodesLinks = maxLinksPerPair * nodeCount

  const maxLinksCount =
    maxNodesLinks < desiredLinks ? maxNodesLinks : desiredLinks

  // --- generate links until we reach the target count ---
  while (links.length < maxLinksCount) {
    const i = Math.floor(Math.random() * nodeCount)
    const j = Math.floor(Math.random() * nodeCount)

    const source = nodes[i].id
    const target = nodes[j].id

    // number of parallel links between this pair
    const count = Math.ceil(Math.random() * maxLinksPerPair)

    for (let k = 0; k < count && links.length < desiredLinks; k++) {
      links.push({
        id: `${linkIndex++}`,
        source,
        target,
      })
    }
  }

  return { nodes, links }
}

export function Main() {
  const graphRef = React.useRef<GraphRef>(null)
  const [nodeCount, setNodeCount] = React.useState(1000)
  const [currentNode, setCurrentNode] = React.useState<string>()
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
    withLinksArrows: false,
    // linkWidth: 1.5,
    // linkDistance: 80,
    // repulsion: -50,
    // directed: false,
  })

  const { nodes, links } = React.useMemo(() => {
    if (!nodeCount) return { nodes: [], links: [] }
    const { nodes, links } = createRandomGraph(nodeCount, linkCount)
    return { nodes, links }
  }, [nodeCount, linkCount])

  React.useEffect(() => {
    if (!currentNode) return
    const node = nodes.find((node) => node.id === String(currentNode))
    if (!node?.x || !node?.y) return
    graphRef.current?.centerAt(node.x, node.y, 4, 800)
  }, [currentNode])

  return (
    <div className="w-full h-full flex gap-4 bg-black">
      <Block className="w-[250px] h-full overflow-auto" label="Graph Controls">
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
                setSettings({
                  ...settings,
                  nodeRadius: Number(e.target.value),
                })
              }
              className="w-full mb-3"
            />
          </Field>
          <div className="flex flex-col gap-3 mt-3">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-[#bbbfca]">Ref</div>
              <Separator orientation="horizontal" />
            </div>
            <Field label="Zoom to">
              <Select
                value={currentNode}
                items={
                  nodes
                    .slice(nodes.length / 2, nodes.length / 2 + 20)
                    .map((node) => ({ label: node.id, value: node.id })) ?? []
                }
                onChange={(value) => setCurrentNode(value)}
              />
            </Field>
          </div>
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
              <div className="flex gap-2">
                <Checkbox
                  id="withLinksArrows"
                  checked={settings.withLinksArrows}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      withLinksArrows: !settings.withLinksArrows,
                    })
                  }
                />
                <Label htmlFor="withLinksArrows">With arrows</Label>
              </div>
            </div>
          </div>
        </div>
      </Block>

      {/* --- GRAPH PANEL --- */}
      <Block>
        <div className="w-full h-full rounded-lg overflow-hidden">
          <Graph
            ref={graphRef}
            nodes={nodes}
            links={links}
            isFixed={isFixed}
            colors={colors}
            settings={settings}
            // onSelectedNode={handleSelectedNode}
          />
        </div>
      </Block>
    </div>
  )
}
