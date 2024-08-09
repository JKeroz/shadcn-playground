"use client"

import { CSSProperties, useRef } from "react"

import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table-ui/data-table-pagination"
import { DataTableColumnHeader } from "@/components/data-table-ui/data-table-column-header"
import { DataTableScrollArea } from "@/components/data-table-ui/data-table-scroll-area"
import { DataTableViewOptions } from "@/components/data-table-ui/data-table-view-options"
import { cn } from "@/lib/utils"

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
        right: ["actions"],
      }
    }
  })

  const getCommonPinningStyles = (column: Column<TData>, isCell?: boolean): CSSProperties => {
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
      background: isPinned ? "hsl(var(--background))" : undefined,
      border: '1px solid hsl(var(--border))',
      zIndex: isPinned 
        ? 
          isCell 
            ? 1 
            : 100 
        : 0,
    }
  }
  return (
    <div className="flex flex-col">
      <div className="flex flex-col bg-background p-1">
       <DataTableViewOptions table={table} />
      </div>
      <DataTableScrollArea className="rounded-md border pr-1" viewPortClassName="w-full h-[700px]">
        <Table className="border-separate border-spacing-0">
          <TableHeader className="sticky top-0 w-90 z-10 bg-background rounded-mb">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { column } = header
                  
                  return (
                    <TableHead className="border-r" key={header.id} style={{ ...getCommonPinningStyles(column) }}>
                      <div className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            typeof header.column.columnDef.header === 'string'
                              ? <DataTableColumnHeader column={column} title={header.column.columnDef.header} />
                              : header.column.columnDef.header,
                            header.getContext()
                          )
                        }
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={cn(
                      row.getIsSelected() ? "bg-background:muted" : "bg-background",
                    )} key={cell.id} style={{ ...getCommonPinningStyles(cell.column, true) }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DataTableScrollArea>
      <div className="flex flex-col bg-background rounded-md rounded-t-none border">
        <DataTablePagination table={table} />
      </div>
   </div>
  )
}
