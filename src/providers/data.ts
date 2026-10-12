import { BaseRecord, DataProvider, GetListParams, GetListResponse } from '@refinedev/core';
import { mockSubjects } from './mockSubjects';

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