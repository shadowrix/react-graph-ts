import React from 'react'

import { Graph } from 'react-graph-ts'
import type { LinkType, NodeType } from 'react-graph-ts'

function createRandomGraph(
  nodeCount: number,
  desiredLinks: number = 6000,
  maxLinksPerPair: number = 1,
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

const { nodes, links } = createRandomGraph(10000, 20000)

export default function App() {
  const [isFixed, setIsFixed] = React.useState(false)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Graph nodes={nodes} links={links} isFixed={isFixed} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '150px',
          height: '100px',
          padding: '20px',
          background: '#fff',
        }}
      >
        <button onClick={() => setIsFixed((prev) => !prev)}>Is fixed?</button>
      </div>
    </div>
  )
}
