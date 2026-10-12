import { Subject } from '@/types';

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: 'CS101',
    name: 'Introduction to Computer Science',
    department: 'CS',
    description: 'An introduction to programming, algorithms, and core computer science concepts.',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 2,
    code: 'ECE220',
    name: 'Digital Logic Design',
    department: 'ECE',
    description: 'Fundamentals of digital systems, logic gates, and combinational circuits.',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 3,
    code: 'MECH310',
    name: 'Thermodynamics',
    department: 'MECH',
    description: 'Principles of energy, heat, and work in engineering systems.',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
];
