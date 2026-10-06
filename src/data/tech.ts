export interface Tech {
  name: string;
  icon: string;
}

const t = (name: string, file: string): Tech => ({ name, icon: `/static/tech/${file}.webp` });

// SQL has no official logo, so sql.webp is a plain database-cylinder mark.
// MySQL, pgvector and Gin are named in the About copy but have no logo files yet.
export const stack: Tech[] = [
  t('Go', 'go'),
  t('Python', 'python'),
  t('SQL', 'sql'),
  t('PostgreSQL', 'postgresql'),
  t('Redis', 'redis'),
  t('Kafka', 'kafka'),
  t('gRPC', 'grpc'),
  t('FastAPI', 'fastapi'),
  t('Docker', 'docker'),
  t('Kubernetes', 'kubernetes'),
  t('Nginx', 'nginx'),
  t('AWS', 'aws'),
];

const pick = (...names: string[]) => names.map((n) => stack.find((s) => s.name === n)!);

export const heroStack = pick('Go', 'Python', 'PostgreSQL', 'gRPC', 'Kafka', 'AWS');
