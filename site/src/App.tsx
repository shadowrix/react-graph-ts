import React from 'react'
import { Graph } from 'react-graph-ts'
import type { LinkType, NodeType } from 'react-graph-ts'

function createRandomGraph(
  nodeCount: number,
  maxLinksPerPair = 1,
  linkProbability = 0.05,
): { nodes: NodeType[]; links: LinkType[] } {
  const nodes: NodeType[] = []
  const links: LinkType[] = []

  for (let i = 0; i < nodeCount; i++) {
    const id = `N${i}`
    nodes.push({ id })
  }

  let linkIdCounter = 1

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < linkProbability) {
        const source = nodes[i].id
        const target = nodes[j].id

        const count = Math.ceil(Math.random() * maxLinksPerPair)

        for (let k = 1; k <= count; k++) {
          links.push({
            id: `${linkIdCounter++}`,
            source,
            target,
            // label: `${source}→${target} #${k}`,
          })
        }
      }
    }
  }

  return { nodes, links }
}

const { nodes, links } = createRandomGraph(1000)

export default function App() {
  const [isFixed, setIsFixed] = React.useState(false)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
