'use client'
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  ShoppingCart,
  Users2,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { functionalUpdate, ColumnDefResolved } from "@tanstack/react-table"
import { columns, EditProduct, InsertProduct, Product, ProductSchema } from "@/components/data-columns/product"
import { CustomTableState, TableUpdaterProps, DataTableControlled } from "@/components/data-table"
import { TableViewOptions } from "@/components/data-table-ui/data-table-view-options"
import { useCallback, useReducer } from "react"
import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query"
import { usePGlite } from "@electric-sql/pglite-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataTablePagination } from "@/components/data-table-ui/data-table-pagination"
import DataTableMultiFilter from "@/components/data-table-ui/data-table-multi-filter"
import { useDataTableQueryParams } from "@/hooks/use-data-table-query-params"
import { QueryParamFilter, QueryParamFilterSchema, QueryParamPagination } from "@/lib/validation/data-table-query-params"

export function myReducer(state: CustomTableState, action: TableUpdaterProps): CustomTableState {
  if (!('type' in action)) return state

  if (action.type === 'onRowSelectionChange' && action.rowSelection) {
    const rowSelection = functionalUpdate(action.rowSelection, state.rowSelection ?? {})
    // console.log('[onRowSelectionChange]', { state, rowSelection, newState: { ...state, rowSelection } })
    return { ...state, rowSelection }
  }

  if (action.type === 'onColumnPinningChange' && action.columnPinning) {
    const columnPinning = functionalUpdate(action.columnPinning, state.columnPinning ?? {})
    // console.log('[onColumnPinningChange]', { state, columnPinning, newState: { ...state, columnPinning } })
    return { ...state, columnPinning }
  }

  if (action.type === 'onColumnVisibilityChange' && action.columnVisibility) {
    const columnVisibility = functionalUpdate(action.columnVisibility, state.columnVisibility ?? {})
    // console.log('[onColumnVisibilityChange]', { state, columnVisibility, newState: { ...state, columnVisibility } })
    return { ...state, columnVisibility }
  }

  if (action.type === 'onPaginationChange' && action.pagination ) {
    const pagination = functionalUpdate(action.pagination, state.pagination ?? { pageIndex: 0, pageSize: 50 })
    // console.log('[onPaginationChange]', { state, pagination, newState: { ...state, pagination } })
    return { ...state, pagination }
  }

  if (action.type === 'onColumnFiltersChange' && action.columnFilters) {
    const columnFilters = functionalUpdate(action.columnFilters, state.columnFilters ?? [])
    // console.log('[onColumnFiltersChange]', { state, columnFilters, newState: { ...state, columnFilters } })
    return { ...state, columnFilters }
  }

  return state
}

export default function Dashboard() {
  const db = usePGlite()
  const { 
    params, 
    setQueryParamsFilters,
    setQueryParamsPagination
  } = useDataTableQueryParams({ schema: ProductSchema })  

  const [state, dispatch] = useReducer(myReducer, {
    columnPinning: { left: ['actions'] },
  })
  
  const queryClient = useQueryClient()
  const getFilters = useCallback((filters: QueryParamFilter[]) => {
    return filters.map((filter, index) => {
      // Validate the filter using Zod
      const parsedFilter = QueryParamFilterSchema.parse(filter);
  
      // Construct the SQL condition
      let condition = `${parsedFilter.target} ${parsedFilter.filter}`;
      
      // Add value if the filter is not a null check
      if (!['IS NULL', 'IS NOT NULL'].includes(parsedFilter.filter)) {
        const value = typeof parsedFilter.value === 'string' ? `'${parsedFilter.value}'` : parsedFilter.value;
        condition += ` ${value}`;
      }
      // Return the condition with the logical operator
      return `${parsedFilter.operator} ${condition}`;
    }).join(' ');
  }, [])
  // Queries
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery<
    {totalCount: number, pageCount: number, rows: any[]},
    Error,
    {totalCount: number, pageCount: number, rows: any[]},
    [string, { pagination: QueryParamPagination, filters: QueryParamFilter[] }]>({
    initialData: {
      pageCount: 0,
      totalCount: 0,
      rows: [],
    },
    queryKey: ['products', { ...params }], 
    queryFn: async ({ queryKey }) => {
      const filters = getFilters(params.filters)
      console.log('[FILTERS]', filters, filters.length, typeof filters)
      const offset = queryKey[1].pagination.pageIndex * queryKey[1].pagination.pageSize
      const pageSize = queryKey[1].pagination.pageSize
      const query = `
        SELECT *, COUNT(*) OVER() AS total_count
        FROM products
        ${filters}
        LIMIT $1 OFFSET $2;
      `
      const values = [queryKey[1].pagination.pageSize, offset];
      const querySQL = db.query<Product & { total_count: number }>(query, values);
      console.log('[querySQL]', querySQL)
      const { rows } = await querySQL;
      const totalCount = rows.length > 0 ? rows[0].total_count : 0;
      const pageCount = Math.ceil(totalCount / pageSize);

      console.log('[queryKey]', {queryKey, totalCount, pageCount, rows, filters})
      return {
        totalCount,
        pageCount,
        rows,
      }
    }, 
    placeholderData: keepPreviousData
  })
  console.log('[queryData]', { data, isLoading, isFetching, error })
  // Mutations
  const { mutate } = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const query = `
        INSERT INTO products (name, description, price, stock_quantity, category, sku) 
        VALUES ($1, $2, $3, $4, $5, $6);
      ` 
      const values = [data.name, data.description, data.price, data.stock_quantity, data.category, data.sku]

      const result = await db.query(
        query,
        values,
      )
      console.log('mutationFn', result)
    }, 
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (error) => {
      console.error('mutationFn ERROR', error)
    },
  })

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <ThemeToggle />
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              {/* <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList> */}
              <div className="ml-auto flex items-center gap-2">
                <DataTableMultiFilter 
                  columns={columns as ColumnDefResolved<Product, unknown>[]}
                  searchParamsFilters={params.filters} 
                  setSearchParamsFilters={setQueryParamsFilters} 
                />
                <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => {
                  // dispatch({ type: 'onColumnVisibilityChange', columnVisibility: { 1: true }})
                }}>
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                {
                  state.columnVisibility && 
                  <TableViewOptions 
                    className="h-7 gap-1" 
                    columns={columns} 
                    setColumnVisibility={dispatch} 
                    columnVisibilityState={state.columnVisibility}
                  />
                }
                
                <EditProduct mutationFn={(data) => mutate(data)}/>
              </div>
            </div>
            <TabsContent value="all" className="flex">
              <Card className="">
                <CardContent className="w-[90vw] md:w-[85vw] lg:w-[90vw] xl:w-[93vw] 2xl:w-[95vw] p-1">
                  <DataTableControlled<Product, unknown> 
                    data={data.rows} 
                    columns={columns}
                    state={{
                      pagination: params.pagination,
                      columnFilters: params.filters,
                      columnPinning: state.columnPinning,
                      rowSelection: state.rowSelection,
                      columnVisibility: state.columnVisibility,
                    }}
                    setColumnPinning={dispatch}
                    setRowSelection={dispatch}
                    setColumnVisibility={dispatch}
                    isLoading={isLoading}
                    isFetching={isFetching}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <div className="flex items-center">
              <DataTablePagination
                setPagination={setQueryParamsPagination}
                rowSelection={state.rowSelection}
                pagination={params.pagination}
                pageSizeOptions={[1, 25, 50, 100]}
                totalCount={data.totalCount}
                pageCount={data.pageCount}
              />
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
