"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getDefaultColumns } from "../data-table-ui/actions"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
  extrafield1?: string
  extrafield2?: string
  extrafield3?: string
  extrafield4?: string
  extrafield5?: string
  extrafield6?: string
  extrafield7?: string
  extrafield8?: string
  extrafield9?: string
  extrafield10?: string
  extrafield11?: string
  extrafield12?: string
  extrafield13?: string
  extrafield14?: string
  extrafield15?: string
}

export const columns: ColumnDef<Payment>[] = [
  ...getDefaultColumns<Payment>(),
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="font-medium text-center">{row.getValue("id")}</div>
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "extrafield1",
    header: "Extrafield1",
  },
  {
    accessorKey: "extrafield2",
    header: "Extrafield2",
  },
  {
    accessorKey: "extrafield3",
    header: "Extrafield3",
  },
  {
    accessorKey: "extrafield4",
    header: "Extrafield4",
  },
  {
    accessorKey: "extrafield5",
    header: "Extrafield5",
  },
  {
    accessorKey: "extrafield6",
    header: "Extrafield6",
  },
  {
    accessorKey: "extrafield7",
    header: "Extrafield7",
  },
  {
    accessorKey: "extrafield8",
    header: "Extrafield8",
  },
  {
    accessorKey: "extrafield9",
    header: "Extrafield9",
  },
  {
    accessorKey: "extrafield10",
    header: "Extrafield10",
  },
  {
    accessorKey: "extrafield11",
    header: "Extrafield11",
  },
  {
    accessorKey: "extrafield12",
    header: "Extrafield12",
  },
  {
    accessorKey: "extrafield13",
    header: "Extrafield13",
  },
  {
    accessorKey: "extrafield14",
    header: "Extrafield14",
  },
  {
    accessorKey: "extrafield15",
    header: "Extrafield15",
  },
]
