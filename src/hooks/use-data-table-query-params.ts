import { SetTableState } from '@/components/data-table';
import { 
  QueryParamFilter, 
  parseQueryParamsFilters, 
  parseQueryParamsPagination, 
  QueryParamPagination,
} from '@/lib/validation/data-table-query-params';
import { parseAsJson, useQueryStates } from 'nuqs'
import { useCallback } from "react"
import { z } from "zod"

type useDataTableQueryParamsProps = {
  schema: z.ZodTypeAny
  defaultFilters?: QueryParamFilter[]
  defaultPagination?: QueryParamPagination
}

export function useDataTableQueryParams({
  schema,
  defaultFilters = [],
  defaultPagination = { pageIndex: 0, pageSize: 50 },
}: useDataTableQueryParamsProps) {
  const [params, setParams] = useQueryStates(
    {
      filters: parseAsJson((filters) => parseQueryParamsFilters(filters, schema)).withDefault(defaultFilters),
      pagination: parseAsJson(parseQueryParamsPagination).withDefault(defaultPagination),
    },
    {
      history: 'push'
    }
  )

  const setQueryParamsFilters = useCallback<SetTableState<'columnFilters', void, QueryParamFilter[]>>(({ columnFilters }) => {
    if (!columnFilters) return
    setParams((prev) => {
      if (typeof columnFilters === 'function') return { ...prev, filters: [...columnFilters(prev.filters)] }
      return { ...prev, filters: [...columnFilters] }
    })
  }, [setParams])

  const setQueryParamsPagination = useCallback<SetTableState<'pagination'>>(({ pagination }) => {
    if (!pagination) return
    setParams((prev) => {
      if (typeof pagination === 'function') return { ...prev, pagination: pagination(prev.pagination) }
      return { ...prev, pagination } 
    })
  }, [setParams])
  
  return {
    params,
    setQueryParamsFilters,
    setQueryParamsPagination,
  }
}