export interface Role {
  company: string;
  url: string;
  role: string;
  start: string;
  end: string;
  location: string;
  summary: string;
}

export const experience: Role[] = [
  {
    company: 'Myntlo',
    url: 'https://myntlo.com/',
    role: 'Founder',
    start: 'May 2026',
    end: 'Present',
    location: 'Little Ferry, NJ',
    summary:
      'At Myntlo, we believe every conversation should create clarity, momentum, and action. Our mission is to help people and teams turn meetings into meaningful progress by bringing important ideas, decisions, and next steps back into focus. We build with simplicity, speed, and trust in mind, helping teams stay aligned and move forward with confidence.',
  },
  {
    company: 'Arka',
    url: 'https://www.arka.com/',
    role: 'Software Engineer Intern',
    start: 'June 2026',
    end: 'Present',
    location: 'Austin, TX',
    summary:
      "I own and execute backend infrastructure tickets supporting Arka's core platform, from investigating system failures to architecting fixes and validating outcomes in production. My work includes building Postgres-backed job reliability systems, such as a stale-job reaper with automated requeue logic, and hardening webhook delivery through retry-with-backoff and persistent delivery logging, focusing on correctness and reliability across distributed backend services.",
  },
  {
    company: 'Deepiri',
    url: 'https://deepiri.com/',
    role: 'Software Engineer Intern',
    start: 'Nov 2025',
    end: 'May 2026',
    location: 'Pittsburgh, PA',
    summary:
      'I contributed to strengthening the performance, scalability, and reliability of backend systems within a distributed architecture. I worked on improving how services handled high traffic, failures, and real-world production load while increasing system observability, focusing on resilient infrastructure that could scale efficiently and operate reliably under pressure.',
  },
  {
    company: 'Outamation',
    url: 'https://outamation.com/',
    role: 'AI/ML Engineer Extern',
    start: 'Oct 2025',
    end: 'Dec 2025',
    location: 'Remote',
    summary:
      'I built an end-to-end document intelligence system for large, unstructured mortgage PDFs. I focused on layout-aware OCR extraction and Retrieval-Augmented Generation pipelines that enable semantic search and Q&A over complex documents, then wrapped the final system in an interactive chatbot for real-world mortgage automation use cases.',
  },
];
