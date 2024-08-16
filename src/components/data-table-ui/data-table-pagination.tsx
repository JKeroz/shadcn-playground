import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import { PaginationState, RowSelectionState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dispatch } from "react"

interface DataTablePaginationProps {
  dispatch: Dispatch<Record<string, unknown>> 
  rowSelection: RowSelectionState
  pagination: PaginationState
  pageSizeOptions?: number[]
  totalCount: number
  pageCount: number
}

export function DataTablePagination({
  dispatch,
  rowSelection,
  pagination,
  pageSizeOptions = [1, 10, 20, 30, 40, 50],
  totalCount,
  pageCount,
}: DataTablePaginationProps) {
  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
      <div className="flex flex-row gap-20 whitespace-nowrap text-sm text-muted-foreground">
        <div>
          Total {totalCount} records
        </div>
        <div>
          {Object.keys(rowSelection).length} of {pagination.pageSize} row(s) selected.
        </div>
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              const currentItemIndex = pagination.pageIndex * pagination.pageSize;
              const newPageIndex = Math.floor(currentItemIndex / newPageSize);
              dispatch({ type: 'onPaginationChange', updater: { pageIndex: newPageIndex, pageSize: newPageSize } })
            }}
          >
            <SelectTrigger className="h-8 w-[4.5rem] bg-background">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Page {pagination.pageIndex + 1} of{" "}
          {totalCount > 0 ? pageCount : 0 }
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => 
              dispatch({ type: 'onPaginationChange', updater: { ...pagination, pageIndex: 0 } })
            }
            disabled={pagination.pageIndex === 0}
          >
            <DoubleArrowLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => 
              dispatch({ type: 'onPaginationChange', updater: { ...pagination,pageIndex: pagination.pageIndex - 1 } })
            }
            disabled={pagination.pageIndex === 0}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => 
              dispatch({ type: 'onPaginationChange', updater: { ...pagination,pageIndex: pagination.pageIndex + 1 } })
            }
            disabled={pagination.pageIndex === pageCount - 1}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => 
              dispatch({ type: 'onPaginationChange', updater: { ...pagination, pageIndex: pageCount - 1 } })
            }
            disabled={pagination.pageIndex === pageCount - 1}
          >
            <DoubleArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}