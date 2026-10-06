import { diagrams, type Diagram } from './diagrams';

export interface Project {
  name: string;
  /** null = deliberately not a link (no working public URL). */
  url: string | null;
  description: string;
  tags: string[];
  /** Screenshot, used when there is no diagram. */
  image?: string;
  diagram?: Diagram;
  /** Narrower layout swapped in on phones, where the full diagram would be unreadable. */
  diagramCompact?: Diagram;
  feature?: boolean;
  /** Text and visual side by side across two columns. */
  wide?: boolean;
  /** Headline numbers, taken from the description. */
  stats?: { value: string; label: string }[];
}

// Every description follows one shape and runs about the same length, so cards in a
// bento row line up. Measured numbers go in `stats`, not the paragraph.
export const projects: Project[] = [
  {
    name: 'Belady',
    url: 'https://github.com/JustinK33/Belady',
    description:
      "Distributed cache in Go whose eviction policy learns to approximate Belady's optimal algorithm: a LightGBM model trained on sampled access traces predicts which object is reused furthest in the future, and the registry streams new models to live nodes without a restart.",
    tags: ['Go', 'gRPC', 'Protobuf', 'Python', 'LightGBM', 'Prometheus', 'Grafana', 'Docker Compose'],
    diagram: diagrams.belady,
    diagramCompact: diagrams.beladyCompact,
    feature: true,
    stats: [
      { value: '0.8702', label: 'object hit ratio on a three-node cluster, vs 0.8636 sampled LRU' },
      { value: '9.4%', label: 'of the remaining gap to optimal closed' },
      { value: '~0.5 µs', label: 'model scoring per eviction' },
    ],
  },
  {
    name: 'Conduit',
    url: 'https://github.com/JustinK33/Conduit',
    description:
      'Distributed job queue and lightweight ELT runtime in Go, built so background work survives crashes and restarts: Gin handles intake, Kafka carries jobs, Postgres tracks job state with leases, Redis Redlock provides mutual exclusion, and Prometheus exports metrics.',
    tags: ['Go', 'Gin', 'Kafka', 'PostgreSQL', 'Redis', 'Prometheus', 'Kubernetes', 'GitHub Actions'],
    diagram: diagrams.conduit,
  },

  {
    name: 'LinkNest',
    url: 'https://github.com/JustinK33/LinkNest',
    description:
      'Multi-tenant link-in-bio service in Go, built so the hard part lives in the data layer: idempotent click ingestion, an append-only event log, and batched hourly and daily analytics rollups, with the whole write path load-tested using k6.',
    tags: ['Go', 'SQL', 'MySQL', 'Docker', 'Prometheus', 'k6', 'GitHub Actions', 'Live: linknest.info'],
    image: '/static/linknest.webp',
  },
  {
    name: 'Pulsegrid',
    url: 'https://github.com/JustinK33/Pulsegrid',
    description:
      'Streaming ingest pipeline in Python, built so one malformed record cannot stall the stream: Pydantic validates every Redpanda message, Postgres writes are batched, failures land in a dead-letter table, and an Airflow DAG rebuilds the SQL analytics layer.',
    tags: ['Python', 'Redpanda', 'Kafka', 'PostgreSQL', 'Apache Airflow', 'SQL', 'Pydantic'],
    diagram: diagrams.pulsegrid,
  },  {
    name: 'NoteTube',
    url: 'https://github.com/JustinK33/NoteTube',
    description:
      'Turns YouTube videos and audio into searchable notes, built to keep slow work off the request path: Celery workers absorb the 30-150 second transcription and embedding jobs, a content service talks over gRPC, and search runs on pgvector.',
    tags: ['Python', 'Django', 'Celery', 'gRPC', 'pgvector', 'AWS', 'Live: notetube.dev'],
    image: '/static/notetube.webp',
  },
  {
    // The old href (github.com/Tylerrs1423/RUMyValentineV2) returns 404, so this card is
    // deliberately not a link rather than a dead click.
    name: 'RU My Valentine',
    url: null,
    description:
      'Campus matching platform in Python, built for the traffic spike of a campus event: FastAPI handles authentication and compatibility scoring, Postgres with pgvector powers scalable search, and SQLAlchemy and Pydantic keep the data layer typed. Serving 2000+ users.',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'SQLAlchemy', 'Pydantic', 'Source not public'],
    image: '/static/rumv.webp',
    wide: true,
  },
];
