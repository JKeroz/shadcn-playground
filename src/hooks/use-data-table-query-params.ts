import { SetTableState } from '@/components/data-table';
import { getSqlComparisonOperators, getSqlLogicalOperators } from "@/components/data-table-ui/data-table-multi-filter"
import { parseAsJson, useQueryStates } from 'nuqs'
import { useCallback } from "react"
import { z } from "zod"

export const QueryParamFilterSchema = z.object({
  id: z.number(),
  operator: z.custom<string>((value) => getSqlLogicalOperators().find((x) => x.name === value), { message: 'Invalid operator'}),
  target: z.string(),
  filter: z.custom<string>((value) => getSqlComparisonOperators().find((x) => x.name === value), { message: 'Invalid filter'}),
  value: z.string().or(z.number()).or(z.boolean()).optional(),
})
.transform((data) => {
  if (data.value && data.filter.toUpperCase().includes('LIKE')) {
    data.value = `%${data.value}%`
  }
  return data
})

export type QueryParamFilter = z.infer<typeof QueryParamFilterSchema>

export const QueryParamPaginationSchema = z.object({
  pageIndex: z.number().optional().default(0),
  pageSize: z.number().optional().default(50),
})
export type QueryParamPagination = z.infer<typeof QueryParamPaginationSchema>

export function parseQueryParamsFilters(filters?: unknown, schema?: z.ZodTypeAny): QueryParamFilter[] {
  if (!filters || !Array.isArray(filters)) return [];
  const keys = schema ? zodKeys(schema) : null;

  const parsedFilters = filters
    .filter((x) => {
      const { success, data, error } = QueryParamFilterSchema.safeParse(x);

      if (!success) return false;
      if (keys) return keys.includes(data.target);
      if (error) {
        console.log('Filter parsing error', error)
      }
      return success
    })
  return parsedFilters
}

const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
  
	return [];
};

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
      pagination: parseAsJson(QueryParamPaginationSchema.parse).withDefault(defaultPagination),
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