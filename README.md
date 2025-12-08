<h1 align="center">react-graph-ts</h1>

<p align="center">
  Easy to define, manipulate and visualize graph data directly in React apps.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-graph-ts">
    <img src="https://img.shields.io/npm/v/react-graph-ts.svg?style=for-the-badge&logo=npm&color=CB3837" />
  </a>
  <a href="https://www.npmjs.com/package/react-graph-ts">
    <img src="https://img.shields.io/npm/dm/react-graph-ts.svg?style=for-the-badge&color=blue" />
  </a>
  <a href="https://shadowrix.github.io/react-graph-ts/">
    <img src="https://img.shields.io/static/v1?label=Docs&message=Live%20Demo&color=brightgreen&style=for-the-badge" />
  </a>
</p>

<!-- # react-graph-ts -->

<!-- `react-graph-ts` — Graph library with D3 for React + TypeScript

_Easy to define, manipulate and visualize graph data directly in React apps._ -->

## 🚀 Quick Start

Install via npm or yarn:

```bash
npm install react-graph-ts
# or
yarn add react-graph-ts
```

Then use in your React + TypeScript project:

```ts
import React from "react";
import { Graph } from "react-graph-ts";

function MyGraph() {
  const nodes = [
    { id: "1", label: "Node 1" },
    { id: "2", label: "Node 2" },
  ];

  const links = [
    { id: "1", source: "1", target: "2", label: "Link 1 → 2" },
  ];

  return (
    <Graph nodes={nodes} links={links} />
  );
}

export default MyGraph;
```

## 🧩 What is it

- `react-graph-ts` is a library built on top of [`d3`](https://d3js.org/), aimed at React + TypeScript developers who need graph / network visualizations.
- It streamlines combining React’s declarative UI and D3’s powerful data-driven rendering. Internally you get a type-safe, TS-friendly API for graph data and rendering.
- The goal: let you define nodes and links as plain data + React components/props — without wrestling directly with D3 DOM manipulations or SVG boilerplate.

## ✅ Features

- **TypeScript-first**: full TS support for nodes, links, graph definitions, and props — ideal for modern React/TS projects.
- **React-friendly**: Use JSX/TSX and React props to declare graphs; integrate seamlessly in React component tree.
- **Based on D3**: Under the hood uses D3 for force layout / rendering flexibility; you get the power of D3 with ease of React.
- **Configurable**: Customize graph container size, node/links styling, layout parameters (force/physics), interactivity (drag, zoom), labels, etc.
- **Flexible data model**: Accepts arbitrary node/links data shapes (with required unique IDs), enabling you to model simple or complex networks.

## 📦 Usage Example

Here’s a more complete example, showing basic data and layout.

// (You can include more detailed examples, e.g., with custom styling, interactive drag/zoom, grouped graphs, etc.)

```ts
import React from "react";
import { Graph } from "react-graph-ts";

const nodes = [
  { id: "a", label: "Alice" },
  { id: "b", label: "Bob" },
  { id: "c", label: "Carol" },
];

const links = [
  { id: "1", source: "a", target: "b", label: "friend" },
  { id: "2", source: "a", target: "c", label: "colleague" },
];

const colors = {
  background: '#2d313a',

  node: '#4b5bbe',
  nodeHover: '#ec69b3',
  nodeActive: '#DDB67D',

  link: '#5F74C2',
  linkHover: '#ec69b3',
  linkActive: '#DDB67D',

  nodeLabel: '#D9DBE0',

  particles: '#ff1974',
}

function SocialGraph() {
  return (
    <Graph
      nodes={nodes}
      links={links}
      colors={colors}
    />
  );
}

export default SocialGraph;
```

_(Adjust nodes / links / colors based on library API — just an illustrative example.)_

## ⚙️ API Overview

- **Graph Component** — main entry point: accepts `nodes`, `links` and optional config/props for styling, layout, interactivity.
- **Node & Link definitions** — specify nodes with at least `id`, and links with `id`, `source`, `target`, optionally `label` and `settings`, custom attributes.
- **Layout & Interactivity Options** — allows customizing force simulation parameters, drag/zoom behaviors, appearance of nodes/links.
- **Full TypeScript support** — data models and props are typed, enabling compile-time safety and autocompletion.

## 🎯 Use Cases

- Visualizing **social networks**, **dependency graphs**, **flow diagrams**, **trees / hierarchies**, **state graphs**, **knowledge graphs**, etc.
- Building **interactive editors** or **network analysis tools** in React/TS applications.
- Rapid prototyping of graph data — use plain JSON + React components without needing deep D3 expertise.

## 🛠️ Why React + D3?

Using D3 directly in React can be cumbersome: mixing DOM manipulations, lifecycle hooks, and SVG code often leads to boilerplate.
With `react-graph-ts`, you keep React's declarative paradigm and still get D3's layout & rendering power — gaining **readability, maintainability, type safety, and dev ergonomics**.

## 📄 API Reference & Documentation

See the project’s docs / source code for full API details — node/link props, layout customizations, event handlers, and examples.

## 💡 Contributing

Contributions are welcome! If you find bugs or missing features — feel free to open issues or PRs. Please follow the existing code style / TypeScript conventions.

## 📄 License

MIT License (see license file).
