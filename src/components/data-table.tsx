'use client'
import { Cell, Column, ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { DataTablePagination } from '@/components/data-table-ui/data-table-pagination';
import { DataTableScrollArea } from '@/components/data-table-ui/data-table-scroll-area';
import { DataTableColumnHeader } from '@/components/data-table-ui/data-table-column-header';
import { CSSProperties } from 'react';
import { TableViewOptions } from '@/components/data-table-ui/data-table-view-options';
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20
      },
      columnPinning: {
        left: ["select"],
      }
    }
  })

  const getCommonPinningStyles = (column: Column<TData>, cell?: Cell<TData, unknown>): CSSProperties => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right')
    return {
      boxShadow: isLastLeftPinnedColumn
        ? "-5px 0 5px -5px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
          ? "5px 0 5px -5px hsl(var(--border)) inset"
          : undefined,
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      opacity: isPinned ? 0.97 : 1,
      position: isPinned ? 'sticky' : 'relative',
      minWidth: column.getSize(),
      background: isPinned 
        ? cell && cell.row.getIsSelected()
          ? "hsl(var(--muted))"
          : "hsl(var(--background))" 
        : undefined,
      zIndex: isPinned 
        ? 
          cell 
            ? 1 
            : 100 
        : 0,
    }
  }

  return (
    <div className="w-full h-full overflow-auto box-border">
      <div className="flex h-[10%] gap-2 bg-background">
        <div className="">
          <TableViewOptions
            columns={ table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )}
            defaultValue={[]}
          />
        </div>
      </div>
      <DataTableScrollArea 
        className="min-w-full h-[84%] border rounded-md overflow-hidden"
        viewPortClassName="min-w-full min-h-[500px] h-full focus:outline-0 focus:border-0 focus:ring-0"
      >
        <Table className="border-separate border-spacing-0">
          <TableHeader className="sticky top-0 w-90 z-10 bg-background">
            {
              table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { column } = header

                  return (
                    <TableHead className="border-b" key={header.id} style={{ ...getCommonPinningStyles(column) }}>
                      <div>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            typeof header.column.columnDef.header === 'string'
                              ? <DataTableColumnHeader
                                  column={column} 
                                  title={header.column.columnDef.header} 
                                />
                              : header.column.columnDef.header,
                            header.getContext()
                          )
                        }
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
              ))
            }
          </TableHeader>
          <TableBody>
            {
              table.getRowModel().rows?.length > 0
                ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <ContextMenu key={cell.id}>
                          <ContextMenuTrigger asChild>
                            {/*Add row border here --> border-r last:border-r-0 */}
                            <TableCell className="" key={cell.id} style={{ ...getCommonPinningStyles(cell.column, cell) }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuItem 
                              inset
                              onClick={() => row.toggleSelected(!row.getIsSelected())}
                            >
                              { 
                                row.getIsSelected() 
                                ? <>Deselect Row</>
                                : <>Select Row</>
                              }
                              {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
                            </ContextMenuItem>
                            <ContextMenuItem 
                              inset
                              onClick={() => navigator.clipboard.writeText(String(cell.getValue()))}
                            >
                              Copy Cell Content
                              {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                    </TableRow>
                  ))
                )
                : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
      </DataTableScrollArea>
      <div className="flex flex-col bg-background">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
