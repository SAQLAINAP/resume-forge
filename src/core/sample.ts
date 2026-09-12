import type { ResumeData } from './types'

/** Only used to make empty gallery previews legible. Never written to a profile. */
export const SAMPLE_DATA: ResumeData = {
  basics: {
    fullName: 'Ananya Rao',
    headline: 'Backend Engineer · Distributed Systems',
    email: 'ananya.rao@example.com',
    phone: '+91 98765 43210',
    dob: '2001-04-12',
    location: 'Bengaluru, India',
    summary:
      'Backend engineer with four years building high-throughput payment and messaging infrastructure. Comfortable owning a service from schema design through on-call.',
    links: [
      { id: 'l1', label: 'github.com/ananyarao', url: 'https://github.com/ananyarao', kind: 'github' },
      { id: 'l2', label: 'linkedin.com/in/ananyarao', url: 'https://linkedin.com/in/ananyarao', kind: 'linkedin' },
    ],
  },
  education: [
    {
      id: 'e1',
      institution: 'Indian Institute of Technology, Bombay',
      degree: 'B.Tech',
      field: 'Computer Science & Engineering',
      startDate: '2018-07',
      endDate: '2022-05',
      score: '8.92',
      scoreType: 'CGPA',
      location: 'Mumbai, India',
      coursework: ['Distributed Systems', 'Operating Systems', 'Databases', 'Algorithms'],
    },
    {
      id: 'e2',
      institution: 'Delhi Public School',
      degree: 'Class XII, CBSE',
      field: 'PCM with Computer Science',
      startDate: '2016-04',
      endDate: '2018-03',
      score: '96.4',
      scoreType: 'Percentage',
      location: 'Bengaluru, India',
      coursework: [],
    },
  ],
  experience: [
    {
      id: 'x1',
      company: 'Razorpay',
      role: 'Software Engineer II',
      employmentType: 'Full-time',
      startDate: '2022-06',
      endDate: '',
      current: true,
      location: 'Bengaluru, India',
      bullets: [
        'Rebuilt the settlement reconciliation pipeline on Kafka, cutting end-of-day close from 4 hours to 18 minutes.',
        'Led migration of 240M rows from MySQL to Postgres with zero downtime and no data loss.',
        'Cut p99 checkout latency from 820ms to 310ms by removing three synchronous calls from the hot path.',
      ],
      tech: ['Go', 'Kafka', 'Postgres', 'Kubernetes'],
    },
    {
      id: 'x2',
      company: 'Flipkart',
      role: 'Software Engineering Intern',
      employmentType: 'Internship',
      startDate: '2021-05',
      endDate: '2021-07',
      current: false,
      location: 'Bengaluru, India',
      bullets: [
        'Built an internal load-testing harness later adopted by four platform teams.',
        'Reduced search index rebuild time by 35% by parallelising the shard merge step.',
      ],
      tech: ['Java', 'Elasticsearch'],
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Raftlite',
      role: 'Solo',
      startDate: '2023-01',
      endDate: '2023-06',
      url: 'https://github.com/ananyarao/raftlite',
      bullets: [
        'A 2,000-line Raft implementation with a deterministic network simulator for reproducible partition tests.',
        'Passes the full Jepsen linearizability suite; 1.4k stars.',
      ],
      tech: ['Rust', 'Tokio'],
    },
  ],
  skills: [
    { id: 's1', category: 'Languages', items: ['Go', 'Rust', 'Python', 'TypeScript', 'SQL'] },
    { id: 's2', category: 'Infrastructure', items: ['Kubernetes', 'Kafka', 'Postgres', 'Redis', 'Terraform'] },
    { id: 's3', category: 'Practices', items: ['Distributed tracing', 'Load testing', 'Incident response'] },
  ],
  achievements: [
    {
      id: 'a1',
      title: 'All India Rank 412, JEE Advanced',
      issuer: 'IIT JEE',
      date: '2018-06',
      description: 'Top 0.04 percentile of 1.1 million candidates.',
    },
    {
      id: 'a2',
      title: 'Winner, Smart India Hackathon',
      issuer: 'Government of India',
      date: '2021-08',
      description: '',
    },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      date: '2023-09',
      credentialId: 'CKA-2023-8841',
      url: '',
    },
  ],
  publications: [
    {
      id: 'pub1',
      title: 'Bounded-staleness reads for regional payment ledgers',
      venue: 'VLDB Workshops',
      date: '2024-08',
      authors: 'Ananya Rao, K. Mehta',
      url: '',
    },
  ],
  positions: [
    {
      id: 'po1',
      title: 'Head, Web & Coding Club',
      organization: 'IIT Bombay',
      startDate: '2020-08',
      endDate: '2021-05',
      bullets: ['Ran a 400-person intro-to-systems bootcamp across two semesters.'],
    },
  ],
  extracurriculars: [
    {
      id: 'ec1',
      activity: 'Competitive Programming',
      organization: 'Codeforces',
      date: '2021-01',
      description: 'Candidate Master, peak rating 1943.',
    },
  ],
  languages: [
    { id: 'lg1', language: 'English', proficiency: 'Fluent' },
    { id: 'lg2', language: 'Hindi', proficiency: 'Native' },
    { id: 'lg3', language: 'Kannada', proficiency: 'Native' },
  ],
}
