import type { SimulationNodeDatum } from 'd3'

export type NodeType = {
  id: string
} & SimulationNodeDatum

export type LinkType = {
  id: string
  source: string
  target: string
}
