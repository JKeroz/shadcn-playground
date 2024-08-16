import { MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"

export function getDefaultColumns<TData extends {id: number}>(): ColumnDef<TData>[] {
  return [
    {
      id: "actions",
      enablePinning: false,
      enableColumnFilter: false,
      enableGrouping: false,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      header: "",
      cell: ({ row, table }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="border-r-0">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(row.original.id))}
              >
                Copy payment ID
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
      },
      minSize: 50,
      maxSize: 50,
      size: 50,
      meta: {
        isUtilityColumn: true,
      }
    },
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //       className="translate-y-0.5"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //       className=""
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    //   size: 35,
    //   meta: {
    //     isUtilityColumn: true,
    //   }
    // },
  ]
}
  