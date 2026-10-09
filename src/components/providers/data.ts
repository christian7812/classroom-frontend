import { BaseRecord, DataProvider, GetListParams, GetListResponse } from '@refinedev/core';
import { Subject } from '../../types';

const mockSubjects: Subject[] = [
  {
    id: 1,
    code: 'CS101',
    name: 'Introduction to Computer Science',
    department: 'Computer Science',
    description: 'An introduction to programming, algorithms, and core computing concepts.',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 2,
    code: 'MATH201',
    name: 'Linear Algebra',
    department: 'Mathematics',
    description: 'A study of vectors, matrices, linear transformations, and their applications.',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 3,
    code: 'BIO110',
    name: 'Principles of Biology',
    department: 'Biological Sciences',
    description: 'An overview of cell biology, genetics, evolution, and organismal systems.',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
];

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    if (resource !== 'subjects') return { data: [] as TData[], total: 0 };

    return {
      data: mockSubjects as unknown as TData[],
      total: mockSubjects.length,
    };
  },

  // Placeholders, so the object satisfies the DataProvider type
  getOne: async () => {
    throw new Error('getOne is not implemented yet');
  },
  create: async () => {
    throw new Error('create is not implemented yet');
  },
  update: async () => {
    throw new Error('update is not implemented yet');
  },
  deleteOne: async () => {
    throw new Error('deleteOne is not implemented yet');
  },
  getApiUrl: () => '',
};
