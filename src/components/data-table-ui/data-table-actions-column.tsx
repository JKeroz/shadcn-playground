import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createColumnHelper } from "@tanstack/react-table"

export function getActionsColumn<TData>() {
  return createColumnHelper<TData>().display(
    {
      id: 'actions',
      enablePinning: false,
      enableColumnFilter: false,
      enableGrouping: false,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      minSize: 50,
      maxSize: 50,
      size: 50,
      meta: {
        isUtilityColumn: true,
      },
      cell: ({ row, table }) => {
        return (
          <DropdownMenu>
          <DropdownMenuTrigger asChild className="border-r-0">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(row.original))}
            >
              Copy row ID
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const data = table.getAllColumns()
                  .filter((column) => column.columnDef.meta)
                  .map((column) => ({ id: column.columnDef.id ?? column.columnDef.header, meta: column.columnDef.meta }))
                console.log(data)
              }}
            >
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )
      }
    }
  )
}
  