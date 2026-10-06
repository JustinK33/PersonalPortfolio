/** Architecture diagrams drawn as SVG on project cards. Coordinates are in viewBox units
    (`width` wide, height derived from the lowest node); `step` orders the hover illumination. */
export interface DiagramNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  step: number;
  accent?: boolean;
}

export interface Diagram {
  width: number;
  nodeW: number;
  nodes: DiagramNode[];
  edges: [from: string, to: string, dashed?: boolean][];
}

export const NODE_H = 48;

export const diagrams: Record<'belady' | 'beladyCompact' | 'conduit' | 'pulsegrid', Diagram> = {
  belady: {
    width: 600,
    nodeW: 150,
    nodes: [
      { id: 'client', label: 'client', sub: 'gRPC get/put', x: 6, y: 106, step: 0 },
      { id: 'c1', label: 'cache-1', sub: 'learned evict', x: 225, y: 22, step: 1, accent: true },
      { id: 'c2', label: 'cache-2', sub: 'learned evict', x: 225, y: 106, step: 1, accent: true },
      { id: 'c3', label: 'cache-3', sub: 'learned evict', x: 225, y: 190, step: 1, accent: true },
      { id: 'reg', label: 'registry', sub: 'model stream', x: 444, y: 64, step: 2 },
      { id: 'train', label: 'trainer', sub: 'LightGBM', x: 444, y: 160, step: 3 },
    ],
    edges: [
      ['client', 'c1'],
      ['client', 'c2'],
      ['client', 'c3'],
      ['reg', 'c1', true],
      ['reg', 'c2', true],
      ['reg', 'c3', true],
      ['train', 'reg'],
    ],
  },
  // Phone layout for Belady: caches stacked on the left, their sources on the right.
  beladyCompact: {
    width: 290,
    nodeW: 130,
    nodes: [
      { id: 'c1', label: 'cache-1', sub: 'learned evict', x: 0, y: 6, step: 1, accent: true },
      { id: 'c2', label: 'cache-2', sub: 'learned evict', x: 0, y: 90, step: 1, accent: true },
      { id: 'c3', label: 'cache-3', sub: 'learned evict', x: 0, y: 174, step: 1, accent: true },
      { id: 'client', label: 'client', sub: 'gRPC get/put', x: 160, y: 6, step: 0 },
      { id: 'reg', label: 'registry', sub: 'model stream', x: 160, y: 132, step: 2 },
      { id: 'train', label: 'trainer', sub: 'LightGBM', x: 160, y: 216, step: 3 },
    ],
    edges: [
      ['client', 'c1'],
      ['client', 'c2'],
      ['client', 'c3'],
      ['reg', 'c1', true],
      ['reg', 'c2', true],
      ['reg', 'c3', true],
      ['train', 'reg'],
    ],
  },
  // Compact two-column layouts for the small cards, so labels stay legible.
  conduit: {
    width: 290,
    nodeW: 130,
    nodes: [
      { id: 'api', label: 'Gin API', sub: 'intake', x: 0, y: 6, step: 0 },
      { id: 'kafka', label: 'Kafka', sub: 'jobs topic', x: 160, y: 6, step: 1, accent: true },
      { id: 'work', label: 'workers', sub: 'leases', x: 160, y: 90, step: 2 },
      { id: 'redis', label: 'Redis', sub: 'Redlock', x: 0, y: 90, step: 3 },
      { id: 'pg', label: 'Postgres', sub: 'job state', x: 160, y: 174, step: 3 },
    ],
    edges: [
      ['api', 'kafka'],
      ['kafka', 'work'],
      ['work', 'pg'],
      ['work', 'redis', true],
    ],
  },
  pulsegrid: {
    width: 290,
    nodeW: 130,
    nodes: [
      { id: 'events', label: 'events', sub: '.csv', x: 0, y: 6, step: 0 },
      { id: 'rp', label: 'Redpanda', sub: 'topic: events', x: 160, y: 6, step: 1, accent: true },
      { id: 'cons', label: 'consumer', sub: 'pydantic', x: 160, y: 90, step: 2 },
      { id: 'dlq', label: 'failed_events', sub: 'dead letter', x: 0, y: 90, step: 3 },
      { id: 'pg', label: 'Postgres', sub: 'batch 100', x: 160, y: 174, step: 3 },
    ],
    edges: [
      ['events', 'rp'],
      ['rp', 'cons'],
      ['cons', 'pg'],
      ['cons', 'dlq', true],
    ],
  },
};
