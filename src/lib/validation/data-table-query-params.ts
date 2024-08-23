import { z } from "zod"
import { LogicalOperatorsEnum, ComparisonOperatorsEnum } from "@/lib/validation/sql-operators"

export type Updater<T> = T | ((old: T) => T)

export const QueryParamFilterSchema = z.object({
  operator: LogicalOperatorsEnum,
  target: z.string(),
  filter: ComparisonOperatorsEnum,
  value: z.string().or(z.number()).or(z.boolean()).optional(),
})
export type QueryParamFilter = z.infer<typeof QueryParamFilterSchema>
export type SetQueryParamsFiltersProps = {
  type: 'onColumnFiltersChange'
  columnFilters: Updater<QueryParamFilter[]>
}

export const QueryParamPaginationSchema = z.object({
  pageIndex: z.number().optional().default(0),
  pageSize: z.number().optional().default(50),
})
export type QueryParamPagination = z.infer<typeof QueryParamPaginationSchema>

export type SetQueryParamsPaginationProps = {
  type: 'onPaginationChange'
  pagination: Updater<QueryParamPagination>,
}

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

export function parseQueryParamsPagination(pagination?: unknown): QueryParamPagination {
  const parsedPagination = QueryParamPaginationSchema.parse(pagination)
  return parsedPagination
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