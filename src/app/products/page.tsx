'use client'
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  ListFilter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Updater, functionalUpdate, PaginationState } from "@tanstack/react-table"
import { columns, EditProduct, Product } from "@/components/data-columns/product"
import { DataTable } from "@/components/data-table"
import { TableViewOptions } from "@/components/data-table-ui/data-table-view-options"
import { useReducer } from "react"
import { useQuery, useQueryClient, keepPreviousData, useMutation } from "@tanstack/react-query"
import { usePGlite } from "@electric-sql/pglite-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataTablePagination } from "@/components/data-table-ui/data-table-pagination"

export function myReducer(state: Record<string, unknown>, action: { type: string, updater: Updater<Record<string, unknown>> }){
  switch (action.type) {
    case 'onPaginationChange':
      const pagination = functionalUpdate(action.updater, state.pagination)
      console.log('paginationChange', { state, pagination })
      return { ...state, pagination }
    case 'onRowSelectionChange':
      const rowSelection = functionalUpdate(action.updater, state.rowSelection)
      console.log('rowSelectionChange', { state, rowSelection })
      return { ...state, rowSelection }
    case 'onColumnVisibilityChange':
      const columnVisibility = functionalUpdate(action.updater, state.columnVisibility)
      console.log('columnVisibilityChange', { state, columnVisibility })
      return { ...state, columnVisibility }
    case 'onColumnPinningChange':
      const columnPinning = functionalUpdate(action.updater, state.columnPinning)
      console.log('columnPinningChange', { state, columnPinning })
      return { ...state, columnPinning }
    default:
      console.log('state', { state, newState: functionalUpdate(action.updater, state) })
      return state;
  }
}

export default function Dashboard() {
  const db = usePGlite()

  const [state, dispatch] = useReducer(myReducer, { 
    pagination: {
      pageSize: 50,
      pageIndex: 0
    },
    columnPinning: {
      left: ["actions"],
    },
    rowSelection: {},
    columnVisibility: {} 
  })
  
  const queryClient = useQueryClient()

  // Queries
  const {
    data,
    isLoading,
    isFetching,
  } = useQuery<
    {totalCount: number, pageCount: number, rows: any[]},
    Error,
    {totalCount: number, pageCount: number, rows: any[]},
    [string, {pagination: PaginationState}]>({
    initialData: {
      pageCount: 0,
      totalCount: 0,
      rows: [],
    },
    queryKey: ['products', { pagination: state.pagination as PaginationState }], 
    queryFn: async ({ queryKey }) => {
      const offset = queryKey[1].pagination.pageIndex * queryKey[1].pagination.pageSize
      const pageSize = queryKey[1].pagination.pageSize
      const query = `
        SELECT *, COUNT(*) OVER() AS total_count
        FROM products
        LIMIT $1 OFFSET $2;
      `;
      const values = [queryKey[1].pagination.pageSize, offset];
      const { rows } = await db.query<Product & { total_count: number }>(query, values);
      const totalCount = rows.length > 0 ? rows[0].total_count : 0;
      const pageCount = Math.ceil(totalCount / pageSize);

      console.log('queryKey', {queryKey, totalCount, pageCount, rows})
      return {
        totalCount,
        pageCount,
        rows,
      }
    }, 
    placeholderData: keepPreviousData
  })

  // Mutations
  const { mutate } = useMutation({
    mutationFn: async (data: Pick<Product, 'name' | 'description' | 'price' | 'stock_quantity' | 'category' | 'sku'>) => {
      const query = `
        INSERT INTO products (name, description, price, stock_quantity, category, sku) 
        VALUES ($1, $2, $3, $4, $5, $6);
      ` 
      const values = [data.name, data.description, data.price, data.stock_quantity, data.category, data.sku]

      const {rows, affectedRows} = await db.query(
        query,
        values,
      )
      console.log('mutationFn', rows, affectedRows)
    }, 
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
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
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => {
                  dispatch({ type: 'columnVisibilityChange', updater: { 1: true }})
                }}>
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <TableViewOptions 
                  className="h-7 gap-1" 
                  columns={columns} 
                  dispatch={dispatch} 
                  columnVisibilityState={state.columnVisibility}
                />
                <EditProduct mutationFn={mutate} />
              </div>
            </div>
            <TabsContent value="all" className="flex">
              <Card className="">
                <CardContent className="w-[90vw] md:w-[85vw] lg:w-[90vw] xl:w-[93vw] 2xl:w-[95vw] p-1">
                  <DataTable 
                    data={data.rows} 
                    columns={columns} 
                    state={state} 
                    dispatch={dispatch}
                    isLoading={isLoading}
                    isFetching={isFetching}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <div className="flex items-center">
              <DataTablePagination
                dispatch={dispatch}
                rowSelection={state.rowSelection}
                pagination={state.pagination}
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
