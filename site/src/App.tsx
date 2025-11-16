import React from 'react'
import { Graph } from 'react-graph-ts'
// const nodes: NodeData[] = [
//     { id: "A", group: "g1" },
//     { id: "B", group: "g1" },
//     { id: "C", group: "g2" },
//     { id: "D", group: "g2" },
//     // ... thousands more
// ];

// const links: LinkData[] = [
//     { source: "A", target: "B", label: "A→B #1" },
//     { source: "A", target: "B", label: "A→B #2" },
//     { source: "B", target: "C", label: "B→C" },
//     { source: "C", target: "A", label: "C→A" },
// ];

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Graph />
    </div>
  )
}
