'use client'
import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PlusIcon, XIcon, FilterIcon, FilterXIcon } from 'lucide-react'
import { TableOptions } from '@tanstack/react-table'
import { SetTableState } from '@/components/data-table'

type SQL_Operators = 'WHERE' | '=' | '<>' | '<' | '<=' | '>' | '>=' | 'AND' | 'OR' | 'NOT' | 'LIKE' | 'NOT LIKE' | 'ILIKE' | 'NOT ILIKE' | 'IS NULL' | 'IS NOT NULL'

export type SQL_Operator = {
  name: SQL_Operators
  description?: string
  type: 'COMPARISON' | 'LOGICAL'
  requiresValue: boolean
}

export type SQL_LogicalOperator = SQL_Operator & {
  type: 'LOGICAL'
}

export type SQL_ComparisonOperator = SQL_Operator & {
  type: 'COMPARISON'
}

export function getSqlOperators(): SQL_Operator[] {
  return [
    { name: '=', description: 'Equals', type: 'COMPARISON', requiresValue: true },
    { name: '<>', description: 'Not equals', type: 'COMPARISON', requiresValue: true},
    { name: '<', description: 'Less than', type: 'COMPARISON', requiresValue: true },
    { name: '<=', description: 'Less than or equal', type: 'COMPARISON', requiresValue: true},
    { name: '>', description: 'Greater than', type: 'COMPARISON', requiresValue: true },
    { name: '>=', description: 'Greater than or equal', type: 'COMPARISON', requiresValue: true },
    { name: 'WHERE', description: 'Logical AND', type: 'LOGICAL', requiresValue: false },
    { name: 'AND', description: 'Logical AND', type: 'LOGICAL', requiresValue: false },
    { name: 'OR', description: 'Logical OR', type: 'LOGICAL', requiresValue: false  },
    { name: 'NOT', description: 'Logical NOT', type: 'LOGICAL', requiresValue: false  },
    { name: 'LIKE', description: 'Match pattern (Case-sensitive)', type: 'COMPARISON', requiresValue: true},
    { name: 'NOT LIKE', description: 'Does not match pattern (Case-sensitive)', type: 'COMPARISON', requiresValue: true},
    { name: 'ILIKE', description: 'Match pattern (Case-insensitive)', type: 'COMPARISON', requiresValue: true},
    { name: 'NOT ILIKE', description: 'Does not match pattern (Case-insensitive)', type: 'COMPARISON', requiresValue: true},
    { name: 'IS NULL', description: 'Is Empty', type: 'COMPARISON', requiresValue: false },
    { name: 'IS NOT NULL', description: 'Is not Empty', type: 'COMPARISON', requiresValue: false },
    // { name: 'BETWEEN', description: 'Within a range' },
    // { name: 'IN', description: 'Within a list of values' },
    // { name: '@@', description: 'Text search match' },
    // { name: '@> ', description: 'Contains (array)' },
    // { name: '<@', description: 'Is contained by (array)' },
    // { name: '&&', description: 'Overlap (array)' },
    // { name: 'NOT LIKE', description: 'Does not match pattern' },
    // { name: 'WHERE NOT', description: 'Excludes rows matching condition' },
    // { name: 'NOT IN', description: 'Not within a list of values' },
    // { name: 'NOT EXISTS', description: 'Negates the existence of rows' }
  ] as const
}

export const getSqlComparisonOperators = () => getSqlOperators().filter((operator) => operator.type === 'COMPARISON')
export const getSqlLogicalOperators = () => getSqlOperators().filter((operator) => operator.type === 'LOGICAL')

export type Filter = {
  id: number
  operator: string
  target: string
  filter: string
  value?: string | number | boolean;
}

type DataTableFiltersProps<TData> = {
  columns: TableOptions<TData>['columns']
  filters: Filter[]
  setFilters: SetTableState<'columnFilters', void, Filter[]>
}

export default function DataTableFilters<TData>({
  columns,
  filters,
  setFilters 
}: DataTableFiltersProps<TData>) {
  const [localFilters, setLocalFilters] = useState<Filter[]>(filters)
  const [open, setOpen] = useState(false)

  const defaultTargetValue = useMemo(() => {
    const filterableColumn = columns.find((col) => col.enableColumnFilter !== false)
    if (filterableColumn && 'accessorKey' in filterableColumn && typeof filterableColumn.accessorKey === 'string') {
      return filterableColumn.accessorKey
    }
    return ''
  }, [columns])

  const allowedColumns = useMemo(() => {
    return columns
      .filter((column) => column.enableColumnFilter !== false && 'accessorKey' in column && typeof column.accessorKey === 'string')
  }, [columns])

  const comparisonOperators = useMemo(() => getSqlComparisonOperators(), [])
  const logicalOperators = useMemo(() => getSqlLogicalOperators(), [])

  const addFilter = () => {
    setLocalFilters((prev) => {
      return prev.concat([{
        id: Date.now(),
        operator: localFilters.length === 0 ? 'WHERE' : 'AND',
        target: defaultTargetValue,
        filter: '=',
        value: ''
      }])
    })
  }

  const removeFilter = (id: number) => {
    setLocalFilters(localFilters.filter(filter => filter.id !== id))
  }

  const updateFilter = (id: number, field: string, value: string) => {
    setLocalFilters(localFilters.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ))
  }

  const removeAllFilters = () => {
    setLocalFilters([])
  }

  const applyFilters = () => {
    setFilters({ columnFilters: localFilters.map((filter) => {
      return {
        ...filter,
        // value: filter.filter.toUpperCase().includes('LIKE') ? `%${filter.value}%` : filter.value
      } 
    })
  })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1">
            { filters && filters.length > 0 
              ? (
                <FilterXIcon className="h-3.5 w-3.5 stroke-not-destructive" />
              )
              : <FilterIcon className="h-4 w-4" />
            } 
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filters
            </span>
            { filters && filters.length > 0 && (
              <span className="ml-1 rounded-full bg-secondary px-1 py-0.5 text-xs text-ellipsis">
                {filters.length}
              </span>
            )}
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-3">
        <div className="space-y-2">
          {localFilters.length === 0 ? (
            <div className="text-center">
              <h4 className="font-medium leading-none mb-2">No filters applied to this view</h4>
              <p className="text-sm text-muted-foreground">Add a column below to filter the view</p>
            </div>
          ) : null}
          <div className="space-y-2">
            {localFilters.map((filter, index) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                  disabled={index === 0}
                >
                  <SelectTrigger className="h-8 w-[90px] text-xs">
                    <SelectValue placeholder="Op" />
                  </SelectTrigger>
                  <SelectContent>
                    {logicalOperators.map(({ name }) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.target}
                  onValueChange={(value) => updateFilter(filter.id, 'target', value)}
                >
                  <SelectTrigger className="h-8 w-[90px] text-xs">
                    <SelectValue placeholder="Column" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedColumns.map((column) => {
                      if (!('accessorKey' in column) || typeof column.accessorKey !== 'string') return null

                      return (
                        <SelectItem key={column.accessorKey} value={column.accessorKey}>{column?.header ? `${column.header}` : column.accessorKey}</SelectItem>
                      ) 
                    })}
                  </SelectContent>
                </Select>
                <Select
                  value={filter.filter}
                  onValueChange={(value) => updateFilter(filter.id, 'filter', value)}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {comparisonOperators.map(({ name, description }) => (
                      <SelectItem key={name} value={name}>{description ?? name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={`${filter.value}`}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                  className="h-8 w-[100px] text-xs"
                  placeholder="Value"
                  disabled={filter.operator.length > 1 && comparisonOperators.find(({ name }) => name === filter.filter)?.requiresValue === false}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-8 w-8 p-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center gap-2">
            <Button onClick={addFilter} variant="outline" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
            <div className="ml-auto flex items-center">
              { localFilters.length > 0 
                ? (
                  <Button onClick={removeAllFilters} variant="outline" size="sm">
                    Reset Filters
                  </Button>
                )
                : null
              }
              <Button onClick={applyFilters} variant="default" size="sm">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}