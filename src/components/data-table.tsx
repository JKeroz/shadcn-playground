'use client'
import { Cell, Column, ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
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
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { DataTableScrollArea } from '@/components/data-table-ui/data-table-scroll-area';
import { DataTableColumnHeader } from '@/components/data-table-ui/data-table-column-header';
import { CSSProperties, Dispatch, useCallback, useMemo } from 'react';
import { Separator } from './ui/separator';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  state: Record<string, unknown>
  dispatch: Dispatch<Record<string, unknown>> 
  viewPortClassName?: string
  isLoading?: boolean
  isFetching?: boolean
}

function getCommonPinningStyles<TData>(column: Column<TData>, cell?: Cell<TData, unknown>): CSSProperties {
  // console.log('COLUMN', { column: column.id, size: column.getSize(), minSize: column.columnDef.minSize, maxSize: column.columnDef.maxSize })
  const isPinned = column.getIsPinned()
  const isUtilityColumn = column.columnDef.meta?.isUtilityColumn
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxShadow: isLastLeftPinnedColumn && !isUtilityColumn
      ? "-5px 0 5px -5px hsl(var(--border)) inset"
      : isFirstRightPinnedColumn && !isUtilityColumn
        ? "5px 0 5px -5px hsl(var(--border)) inset"
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    minWidth: column.columnDef.minSize,
    maxWidth: column.columnDef.maxSize,
    // zIndex: isPinned ? 1 : 0,

    background: isPinned 
    ? cell && cell.row.getIsSelected() && !isUtilityColumn
      ? "hsl(var(--muted))"
      : "hsl(var(--background))"
    : undefined,
    zIndex: isPinned
      ? 
        cell 
          ? 1 
          : 2 
      : 0,
  }
}

export function DataTable<TData, TValue>({
  data, 
  columns,
  state,
  dispatch,
  isLoading,
  isFetching
}: DataTableProps<TData, TValue>) {  
  // const memoizedData = useMemo(() => data, [data]);
  // const memoizedColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    defaultColumn: {
      minSize: 100,
      maxSize: 300,
    },
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    columnResizeDirection: 'ltr',
    columnResizeMode: 'onChange',
    state: {
      ...state,
    },
    onRowSelectionChange: (updater) => {
      dispatch({ type: 'onRowSelectionChange', updater })
    },
    onColumnPinningChange: (updater) => {
      dispatch({ type: 'onColumnPinningChange', updater })
    },
    onColumnVisibilityChange: (updater) => {
      dispatch({ type: 'onColumnVisibilityChange', updater })
    },
    onPaginationChange: (updater) => {
      dispatch({ type: 'onPaginationChange', updater })
    }
  })

  const pinninStylesFn = useCallback(getCommonPinningStyles, [])

  const headers = table.getFlatHeaders()
  const columnSizeVars = useMemo(() => {
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing, headers])
  // console.log('SIZES', { table: table.getTotalSize() })
  return (
    <div className="w-full h-full overflow-auto box-border">
      <DataTableScrollArea 
        className="min-w-full overflow-hidden"
        viewPortClassName="min-w-full h-[80vh] focus:outline-0 focus:border-0 focus:ring-0"
      >
        <Table 
          style={{
            ...columnSizeVars, 
            width: table.getTotalSize() < 1800 ? '100%' : table.getTotalSize()
          }}
        >
          <TableHeader className="sticky top-0 w-90 z-10 bg-background">
            {
              table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="border-separate hover:bg-background" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      style={{ 
                        ...pinninStylesFn(header.column),
                        // width: `calc(var(--header-${header?.id}-size) * 1px)`
                      }}
                    >
                      <div>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            typeof header.column.columnDef.header === 'string'
                              ? <DataTableColumnHeader
                                  header={header}
                                />
                              : header.column.columnDef.header,
                            header.getContext()
                          )
                        }
                        <Separator 
                          className="absolute w-[0.15rem] -top-1 right-0 cursor-col-resize select-none touch-none"
                          orientation="vertical"
                          onDoubleClick={() => header.column.resetSize()}
                          onMouseDown={header.getResizeHandler()} 
                          onTouchStart={header.getResizeHandler()}
                        />
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
              isLoading
              ?  
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center absolute top-1/2 left-1/3 md:left-1/2">
                    {"Loading..."}
                  </TableCell>
                </TableRow>
              : table.getRowModel().rows?.length > 0
              ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      row.toggleSelected(!row.getIsSelected()) 
                      // // Single row selection 
                      // table.getRowModel().rows.map((r) => r.id === row.id ? r.toggleSelected(!r.getIsSelected()) : r.toggleSelected(false))
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      // <ContextMenu key={cell.id}>
                      //   <ContextMenuTrigger asChild>
                      //     {/*Add row border here --> border-r last:border-r-0 */}
                      //     <TableCell className="" key={cell.id} style={{ ...getCommonPinningStyles(cell.column, cell) }}>
                      //       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      //     </TableCell>
                      //   </ContextMenuTrigger>
                      //   <ContextMenuContent className="w-48">
                      //     <ContextMenuItem 
                      //       inset
                      //       onClick={() => row.toggleSelected(!row.getIsSelected())}
                      //     >
                      //       { 
                      //         row.getIsSelected() 
                      //         ? <>Deselect Row</>
                      //         : <>Select Row</>
                      //       }
                      //       <ContextMenuShortcut>⌘K</ContextMenuShortcut>
                      //     </ContextMenuItem>
                      //     <ContextMenuItem 
                      //       inset
                      //       onClick={() => navigator.clipboard.writeText(String(cell.getValue()))}
                      //     >
                      //       Copy Cell Content
                      //       {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
                      //     </ContextMenuItem>
                      //   </ContextMenuContent>
                      // </ContextMenu>
                      <TableCell 
                        className="" 
                        key={cell.id} 
                        style={{ ...pinninStylesFn(cell.column, cell) }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
              : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center absolute top-1/2 left-1/3 md:left-1/2">
                    {"No results found :("}
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </DataTableScrollArea>
    </div>
  );
}