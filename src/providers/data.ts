import { BACKEND_BASE_URL } from '@/constants'
import type { HttpError } from '@refinedev/core';
import type { ListResponse } from '@/types';
import { createDataProvider, type CreateDataProviderOptions } from '@refinedev/rest'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const buildHttpError = async (response: Response): Promise<HttpError> => {
  const payload: unknown = await response.clone().json().catch(() => undefined);
  const message = isRecord(payload)
    ? typeof payload.message === "string"
      ? payload.message
      : typeof payload.error === "string"
        ? payload.error
        : response.statusText
    : response.statusText;

  return {
    message: message || `Request failed with status ${response.status}`,
    statusCode: response.status,
  };
};

const options: CreateDataProviderOptions = {
    getList: {
       getEndpoint: ({resource}) => resource,

       buildQueryParams: async ({ pagination, filters }) => {
        const { currentPage = 1, pageSize = 10 } = pagination ?? {};
        const queryParams: Record<string, string | number> = {
          page: currentPage,
          limit: pageSize,
        };

        for (const filter of filters ?? []) {
          if (!("field" in filter) || typeof filter.value !== "string") {
            continue;
          }

          const value = filter.value.trim();
          if (!value) {
            continue;
          }

          if (filter.field === "department") {
            queryParams.department = value;
          } else if (
            (filter.field === "name" || filter.field === "code") &&
            filter.operator === "contains"
          ) {
            queryParams.search = value;
          }
        }

        return queryParams;
       },

       mapResponse: async(response) => {
        if (!response.ok) {
          throw await buildHttpError(response);
        }

        const payload: ListResponse = await response.json();
        return payload.data ?? [];
       },

       getTotalCount: async(Response) => {
        const payload: ListResponse = await Response.json();
        return payload.total ?? payload.data?.length ?? 0;
       }
    },
    getOne: {
      mapResponse: async (response) => {
        if (!response.ok) {
          throw await buildHttpError(response);
        }

        return response.json();
      },
    },
    create: {
      transformError: async (response) => buildHttpError(response),
    },
    createMany: {
      getEndpoint: ({ resource }) => resource,
      buildBodyParams: async ({ variables }) => variables,
      mapResponse: async (response) => response.json(),
      transformError: async (response) => buildHttpError(response),
    },
    getMany: {
      mapResponse: async (response) => response.json(),
      transformError: async (response) => buildHttpError(response),
    },
    update: {
      transformError: async (response) => buildHttpError(response),
    },
    updateMany: {
      getEndpoint: ({ resource }) => resource,
      buildBodyParams: async ({ variables }) => variables,
      mapResponse: async (response) => response.json(),
      transformError: async (response) => buildHttpError(response),
    },
    deleteOne: {
      transformError: async (response) => buildHttpError(response),
    },
    custom: {
      transformError: async (response) => buildHttpError(response),
    }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };