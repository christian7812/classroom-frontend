import type { BaseRecord, DataProvider, GetListParams, GetListResponse } from "@refinedev/core";
import { mockSubjects } from "./mockSubjects";

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({ resource }: GetListParams): Promise<GetListResponse<TData>> => {
    if (resource !== "subjects") return { data: [], total: 0 };

    return {
      data: mockSubjects as unknown as TData[],
      total: mockSubjects.length,
    };
  },
  getOne: async () => {
    throw new Error("Fetching a single record is not supported by this data provider.");
  },
  create: async () => {
    throw new Error("Creating records is not supported by this data provider.");
  },
  update: async () => {
    throw new Error("Updating records is not supported by this data provider.");
  },
  deleteOne: async () => {
    throw new Error("Deleting records is not supported by this data provider.");
  },
  getApiUrl: () => "mock://subjects",
};