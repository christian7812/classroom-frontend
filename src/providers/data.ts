import { BACKEND_BASE_URL } from '@/constants'
import { ListResponse } from '@/types';
import {createDataProvider, CreateDataProviderOptions} from '@refinedev/rest'

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
        const payload: ListResponse = await response.json();
        return payload.data ?? [];
       },

       getTotalCount: async(Response) => {
        const payload: ListResponse = await Response.json();
        return payload.total ?? payload.data?.length ?? 0;
       }
    }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };