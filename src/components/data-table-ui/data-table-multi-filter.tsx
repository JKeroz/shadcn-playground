'use client'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PlusIcon, XIcon, FilterIcon, FilterXIcon } from 'lucide-react'
import { type QueryParamFilter } from '@/lib/validation/data-table-query-params'
import { ColumnDefResolved } from '@tanstack/react-table'
import { DEFAULT_COMPARISON_OPERATORS, DEFAULT_LOGICAL_OPERATORS } from '@/lib/validation/sql-operators'

type Filter = QueryParamFilter & { id: number }

type DataTableFiltersProps<TData> = {
  columns: ColumnDefResolved<TData, unknown>[]
  searchParamsFilters: QueryParamFilter[] | null
  setSearchParamsFilters: (filters: QueryParamFilter[]) => void
}

export default function DataTableFilters<TData>({
  columns,
  searchParamsFilters,
  setSearchParamsFilters 
}: DataTableFiltersProps<TData>) {
  const [filters, setFilters] = useState<Filter[]>( searchParamsFilters ? searchParamsFilters.map((filter, index) => ({ ...filter, id: index })) : [] )
  const [open, setOpen] = useState(false)

  const addFilter = () => {
    setFilters([...filters, {
      id: Date.now(),
      operator: filters.length === 0 ? 'WHERE' : 'AND',
      target: columns.find((col) => col.accessorKey && col.enableColumnFilter !== false)?.accessorKey ?? '',
      filter: '=',
      value: ''
    }])
  }

  const removeFilter = (id: number) => {
    setFilters(filters.filter(filter => filter.id !== id))
  }

  const updateFilter = (id: number, field: keyof QueryParamFilter, value: string) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ))
  }

  const removeAllFilters = () => {
    setFilters([])
  }

  const applyFilters = () => {
    const sqlQuery = filters.map((filter, index) => {
      return `${index === 0 ? 'WHERE' : filter.operator} ${filter.target} ${filter.filter} '${filter.value}'`
    }).join(' ')
    console.log('Applying SQL-like filters:', sqlQuery)
    setSearchParamsFilters(filters.map(({ operator, target, filter, value }) => ({ operator, target, filter, value })))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1">
            { searchParamsFilters && searchParamsFilters.length > 0 
              ? (
                <FilterXIcon className="h-3.5 w-3.5 stroke-not-destructive" />
              )
              : <FilterIcon className="h-4 w-4" />
            } 
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filters
            </span>
            { searchParamsFilters && searchParamsFilters.length > 0 && (
              <span className="ml-1 rounded-full bg-secondary px-1 py-0.5 text-xs text-ellipsis">
                {searchParamsFilters.length}
              </span>
            )}
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-3">
        <div className="space-y-2">
          {filters.length === 0 ? (
            <div className="text-center">
              <h4 className="font-medium leading-none mb-2">No filters applied to this view</h4>
              <p className="text-sm text-muted-foreground">Add a column below to filter the view</p>
            </div>
          ) : null}
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Select
                  value={filter.operator}
                  onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                  disabled={index === 0}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs">
                    <SelectValue placeholder="Op" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_LOGICAL_OPERATORS.map((op) => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
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
                    {columns.filter((column) => column.enableColumnFilter !== false).map((column) => (
                      <SelectItem key={column.accessorKey} value={`${column.accessorKey}`} className="capitalize">{column.header}</SelectItem>
                    ))}
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
                    {DEFAULT_COMPARISON_OPERATORS.map(({ name, description }) => (
                      <SelectItem key={name} value={name}>{description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={`${filter.value}`}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                  className="h-8 w-[100px] text-xs"
                  placeholder="Value"
                  disabled={filter.operator && DEFAULT_COMPARISON_OPERATORS.find(({ name }) => name === filter.filter)?.value === false}
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
              { filters.length > 0 
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