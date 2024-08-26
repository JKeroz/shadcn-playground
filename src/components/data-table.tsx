'use client'
import { 
  Cell, 
  Column,
  Updater,
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  TableState,
  TableOptions,
  functionalUpdate,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableScrollArea } from '@/components/data-table-ui/data-table-scroll-area';
import { DataTableColumnHeader } from '@/components/data-table-ui/data-table-column-header';
import { CSSProperties, Dispatch, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';

export type SetStateTypeEvents = 'onColumnVisibilityChange' | 'onColumnPinningChange' | 'onPaginationChange' | 'onRowSelectionChange' | 'onColumnFiltersChange'

export type TableUpdaterEvent<TEvent extends SetStateTypeEvents> = {
  type: TEvent
}

export type TableUpdaterActionProps<TKey extends keyof TableState | void = void, TUpdater = void> = 
  TKey extends keyof TableState
    ? TUpdater extends void 
      ? { [K in TKey]?: Updater<TableState[K]> }
      : { [K in TKey]?: Updater<TUpdater> }
    : TUpdater extends void
      ? { [K in keyof TableState]?: Updater<TableState[K]> }
      : { [K in keyof TableState]?: Updater<TUpdater> }

export type CustomTableState<TUpdaterData extends TableState | unknown = TableState> = {
  [K in keyof TableState]?: TUpdaterData extends TableState ? TUpdaterData[K] : TUpdaterData;
}

export type TableUpdaterProps<
  TKey extends keyof TableState | void = void, 
  TEvent extends SetStateTypeEvents | void = void, 
  TUpdater  = void
> =
  TEvent extends SetStateTypeEvents 
      ? TUpdater extends void
        ? TableUpdaterEvent<TEvent> & TableUpdaterActionProps<TKey>
        : TableUpdaterEvent<TEvent> & TableUpdaterActionProps<TKey, TUpdater>
      : TUpdater extends void
        ? TableUpdaterActionProps<TKey>
        : TableUpdaterActionProps<TKey, TUpdater>


export type SetTableState<
  TKey extends keyof TableState, 
  TEvent extends SetStateTypeEvents | void = void,
  TUpdater = void
> = Dispatch<TableUpdaterProps<TKey, TEvent, TUpdater>> | ((props: TableUpdaterProps<TKey, TEvent, TUpdater>) => void)

interface DataTableProps<TData, TValue> {
  columns: TableOptions<TData>['columns']
  data: TData[]
  state: CustomTableState
  initialState?: CustomTableState
  setColumnVisibility?: SetTableState<'columnVisibility'> | SetTableState<'columnVisibility', 'onColumnVisibilityChange'>
  setRowSelection?: SetTableState<'rowSelection'> | SetTableState<'rowSelection', 'onRowSelectionChange'>
  setColumnPinning?: SetTableState<'columnPinning'> | SetTableState<'columnPinning', 'onColumnPinningChange'>
  singleRowSelection?: boolean
  viewPortClassName?: string
  isLoading?: boolean
  isFetching?: boolean
}

export function dataTableStateReducer(state: CustomTableState, action: TableUpdaterProps): CustomTableState {
  if (!('type' in action)) return state

  if (action.type === 'onRowSelectionChange' && action.rowSelection) {
    const rowSelection = functionalUpdate(action.rowSelection, state.rowSelection ?? {})
    return { ...state, rowSelection }
  }

  if (action.type === 'onColumnPinningChange' && action.columnPinning) {
    const columnPinning = functionalUpdate(action.columnPinning, state.columnPinning ?? {})
    return { ...state, columnPinning }
  }

  if (action.type === 'onColumnVisibilityChange' && action.columnVisibility) {
    const columnVisibility = functionalUpdate(action.columnVisibility, state.columnVisibility ?? {})
    return { ...state, columnVisibility }
  }

  if (action.type === 'onPaginationChange' && action.pagination ) {
    const pagination = functionalUpdate(action.pagination, state.pagination ?? { pageIndex: 0, pageSize: 50 })
    return { ...state, pagination }
  }

  if (action.type === 'onColumnFiltersChange' && action.columnFilters) {
    const columnFilters = functionalUpdate(action.columnFilters, state.columnFilters ?? [])
    return { ...state, columnFilters }
  }

  return state
}

function getCommonPinningStyles<TData>(column: Column<TData>, cell?: Cell<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned()
  const isUtilityColumn = column.columnDef.meta && 'isUtilityColumn' in column.columnDef.meta
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

export function DataTableControlled<TData, TValue>({
  data, 
  columns,
  state,
  setColumnPinning,
  setRowSelection,
  setColumnVisibility,
  singleRowSelection,
  isLoading,
  isFetching
}: DataTableProps<TData, TValue>) {  
  
  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    defaultColumn: {
      minSize: 100,
      maxSize: 300,
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    columnResizeDirection: 'ltr',
    columnResizeMode: 'onChange',
  })

  // Set custom state to table
  table.setOptions((prev) => {
    // Set custom state
    if (state) { 
      prev.state = { ...prev.state, ...state }
    }
    
    if (setRowSelection) prev.onRowSelectionChange = (updater) => setRowSelection({ type: 'onRowSelectionChange', rowSelection: updater })
    // Set row visibility state managers
    if (setColumnVisibility) prev.onColumnVisibilityChange = (updater) => setColumnVisibility({ type: 'onColumnVisibilityChange', columnVisibility: updater })
    // Set column pinning state managers
    if (setColumnPinning) prev.onColumnPinningChange = (updater) => setColumnPinning({ type: 'onColumnPinningChange', columnPinning: updater })
    
    return prev
  })

  const pinninStylesFn = useCallback(getCommonPinningStyles, [])

  // const headers = table.getFlatHeaders()
  // const columnSizeVars = useMemo(() => {
  //   const colSizes: { [key: string]: number } = {}
  //   for (let i = 0; i < headers.length; i++) {
  //     const header = headers[i]!
  //     colSizes[`--header-${header.id}-size`] = header.getSize()
  //     colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
  //   }
  //   return colSizes
  // }, [table.getState().columnSizingInfo, table.getState().columnSizing, headers])
  return (
    <div className="w-full h-full overflow-auto box-border">
      <DataTableScrollArea 
        className="min-w-full overflow-hidden"
        viewPortClassName="min-w-full h-[80vh] focus:outline-0 focus:border-0 focus:ring-0"
      >
        <Table 
          style={{
            // ...columnSizeVars, 
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
                      onDoubleClick={() => {
                        if (singleRowSelection) {
                          table.getRowModel().rows.map((r) => r.id === row.id ? r.toggleSelected(!r.getIsSelected()) : r.toggleSelected(false))
                        } else {
                          row.toggleSelected(!row.getIsSelected()) 
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
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