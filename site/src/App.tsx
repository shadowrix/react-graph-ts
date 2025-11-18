import React from 'react'
import { Graph } from 'react-graph-ts'

const nodes = [
  { id: 'A', group: 'g1' },
  { id: 'B', group: 'g1' },
  { id: 'C', group: 'g2' },
  { id: 'D', group: 'g2' },
  // ... thousands more
]

const links = [
  { id: '1', source: 'A', target: 'B', label: 'A→B #1' },
  { id: '2', source: 'A', target: 'B', label: 'A→B #2' },
  { id: '3', source: 'B', target: 'C', label: 'B→C' },
  { id: '4', source: 'C', target: 'A', label: 'C→A' },
]

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
