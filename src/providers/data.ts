import type {BaseRecord,DataProvider,GetListParams,} from "@refinedev/core";
import { BACKEND_BASE_URL } from "@/constants";
import type { PaginatedResponse } from "@/types";

if (!BACKEND_BASE_URL) {
  throw new Error("VITE_BACKEND_BASE_URL is not configured");
}

const API_URL = `${BACKEND_BASE_URL.replace(/\/+$/, "")}/api`;

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams,
  ) => {
    if (params.resource !== "subjects") {
      throw new Error(`The "${params.resource}" resource is not supported yet`);
    }

    const url = new URL(`${API_URL}/subjects`);
    url.searchParams.set(
      "page",
      String(params.pagination?.currentPage ?? 1),
    );
    url.searchParams.set(
      "limit",
      String(params.pagination?.pageSize ?? 10),
    );

    for (const filter of params.filters ?? []) {
      if (!("field" in filter)) {
        throw new Error("Logical filters are not supported by this data provider");
      }

      if (
        (filter.field === "name" || filter.field === "code") &&
        filter.operator === "contains" &&
        typeof filter.value === "string"
      ) {
        url.searchParams.set("search", filter.value);
        continue;
      }

      if (
        filter.field === "department" &&
        filter.operator === "eq" &&
        typeof filter.value === "string"
      ) {
        url.searchParams.set("department", filter.value);
        continue;
      }

      throw new Error(`Unsupported subject filter: ${filter.field}`);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Could not load subjects (HTTP ${response.status})`);
    }

    const result =
      (await response.json()) as PaginatedResponse<TData>;

    return {
      data: result.data,
      total: result.pagination.total,
    };
  },

  getOne: async () => {
    throw new Error("getOne is not implemented yet");
  },
  create: async () => {
    throw new Error("create is not implemented yet");
  },
  update: async () => {
    throw new Error("update is not implemented yet");
  },
  deleteOne: async () => {
    throw new Error("deleteOne is not implemented yet");
  },

  getApiUrl: () => API_URL,
};