import { LinkType, NodeType } from '../typings'

export function buildLinkGrid(links: LinkType[]) {
  const cellSize = 150
  const grid = new Map<string, LinkType[]>()

  function key(cx: number, cy: number) {
    return `${cx},${cy}`
  }

  for (const link of links) {
    const source = link.source as unknown as NodeType
    const target = link.target as unknown as NodeType

    if (source.x && source.y && target.x && target.y) {
      const minX = Math.min(source.x, target.x)
      const maxX = Math.max(source.x, target.x)
      const minY = Math.min(source.y, target.y)
      const maxY = Math.max(source.y, target.y)

      const startX = Math.floor(minX / cellSize)
      const endX = Math.floor(maxX / cellSize)
      const startY = Math.floor(minY / cellSize)
      const endY = Math.floor(maxY / cellSize)

      for (let cx = startX; cx <= endX; cx++) {
        for (let cy = startY; cy <= endY; cy++) {
          const k = key(cx, cy)
          if (!grid.has(k)) grid.set(k, [])
          grid.get(k)!.push(link)
        }
      }
    }
  }

  return grid
}
