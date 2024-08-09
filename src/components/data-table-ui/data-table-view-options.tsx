"use client"

import { MixerHorizontalIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {

  function onColumnToggle() {
    table.getAllColumns().map((colum) => colum.toggleVisibility(!!colum.getIsVisible()))
  }

  return (
    <div className="flex align-middle justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Toggle columns"
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex data-[state=open]:bg-accent"
          >
            <MixerHorizontalIcon className="mr-2 size-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => {}}>
            {/* <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" /> */}
            Asc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
// {
  /* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Toggle columns"
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex data-[state=open]:bg-accent"
          >
            <MixerHorizontalIcon className="mr-2 size-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onColumnToggle}>
            Toggle All
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {}}>
      //       {/* <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" /> *///}
      //       Asc
      //     </DropdownMenuItem>
      //     {table
      //       .getAllColumns()
      //       .filter(
      //         (column) =>
      //           typeof column.accessorFn !== "undefined" && column.getCanHide()
      //       )
      //       .map((column) => {
      //         return (
      //           <DropdownMenuCheckboxItem
      //             key={column.id}
      //             className="capitalize"
      //             checked={column.getIsVisible()}
      //             onCheckedChange={(value) => column.toggleVisibility(!!value)}
      //           >
      //             <span className="truncate">{column.id}</span>
      //           </DropdownMenuCheckboxItem>
      //         )
      //       })}
      //   </DropdownMenuContent>
      // </DropdownMenu> */}