import { 
  QueryParamFilter, 
  SetQueryParamsPaginationProps, 
  parseQueryParamsFilters, 
  parseQueryParamsPagination, 
  QueryParamPagination, 
  SetQueryParamsFiltersProps
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

  const setQueryParamsFilters = useCallback(({ columnFilters }: SetQueryParamsFiltersProps) => {
    setParams((prev) => {
      if (!prev) return typeof columnFilters === 'function' ? { filters: columnFilters(prev) } : { filters:columnFilters }
      return typeof columnFilters === 'function' ? { filters: columnFilters(prev.filters) } : { ...prev, filters: columnFilters }
    })
  }, [setParams])

  const setQueryParamsPagination = useCallback(({ pagination }: SetQueryParamsPaginationProps) => {
    setParams((prev) => {
      if (!prev) return typeof pagination === 'function' ? { pagination: pagination(prev) } : { pagination }
      return typeof pagination === 'function' ? { pagination: pagination(prev.pagination) } : { ...prev, pagination }
    })
  }, [setParams])
  
  return {
    params,
    setQueryParamsFilters,
    setQueryParamsPagination,
  }
}