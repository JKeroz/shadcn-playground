"use client"

import { ColumnDef } from "@tanstack/react-table"
import { getDefaultColumns } from "../data-table-ui/actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export const ProductSchema = z.object({
  id: z.number().readonly(),
  name: z.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name must be less than 255 characters' }).describe('product name'),
  description: z.string().min(1).max(255, { message: 'Description must be less than 255 characters' }).optional(),
  price: z.number().min(1, { message: 'Price is required' }),
  stock_quantity: z.number().min(0, { message: 'Stock quantity is required' }).default(0),
  category: z.string().min(1, { message: 'Category is required' }).max(255, { message: 'Category must be less than 255 characters' }),
  sku: z.string().min(1, { message: 'SKU is required' }).max(20, { message: 'SKU must be less than 20 characters' }),
  created_at: z.date().readonly(),
  updated_at: z.date().readonly().optional(),
})

const InsertProductSchema = ProductSchema.omit({ id: true, created_at: true, updated_at: true })

export type Product = z.infer<typeof ProductSchema>
export type InsertProduct = z.infer<typeof InsertProductSchema>

export const columns: ColumnDef<Product>[] = [
  ...getDefaultColumns<Product>(),
  {
    header: 'ID',
    accessorKey: 'id',
    enableHiding: false,
    enableColumnFilter: false,
  },
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Description',
    accessorKey: 'description',
    size: 800,
    maxSize: 800,
  },
  {
    header: 'Price',
    accessorKey: 'price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return (
        <div className="font-medium">
          {formatted}
        </div>
      )
    },
  },
  {
    header: 'Stock Quantity',
    accessorKey: 'stock_quantity',
  },
  {
    header: 'Category',
    accessorKey: 'category',
  },
  {
    header: 'SKU',
    accessorKey: 'sku',
  },
  {
    header: 'ExtraColumn1',
    accessorKey: 'extraColumn1',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn2',
    accessorKey: 'extraColumn2',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn3',
    accessorKey: 'extraColumn3',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn4',
    accessorKey: 'extraColumn4',
    enableColumnFilter: false,
    
  },
  {
    header: 'ExtraColumn5',
    accessorKey: 'extraColumn5',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn6',
    accessorKey: 'extraColumn6',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn7',
    accessorKey: 'extraColumn7',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn8',
    accessorKey: 'extraColumn8',
    enableColumnFilter: false,
  },
  {
    header: 'ExtraColumn9',
    accessorKey: 'extraColumn9', 
    enableColumnFilter: false, 
  },
  {
    header: 'ExtraColumn10',
    accessorKey: 'extraColumn10',
    enableColumnFilter: false,
  }
]

interface EditProductProps {
  mutationFn: (data: InsertProduct) => Promise<void> | void
}

export function EditProduct({ mutationFn }: EditProductProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const handleSheetToggle = (option: boolean) => {
    setSheetOpen(() => option);
  };

  const form = useForm<InsertProduct>({
    resolver: zodResolver(InsertProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category: '',
      sku: '',
    },
  })
  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetToggle}>
      <SheetTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Product
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit( async (data) => {
            await mutationFn(data)
            handleSheetToggle(false)
          })} className="space-y-8">
            <SheetHeader>
              <SheetTitle>Edit Product</SheetTitle>
              <SheetDescription>
                Make changes to the product here. Click save when you are done.
              </SheetDescription>
            </SheetHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} {...field} />
                  </FormControl>
                  <FormDescription>
                    This is a description for the product name field
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} type="number" {...form.register(field.name, { valueAsNumber: true })} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} type="number" {...form.register(field.name, { valueAsNumber: true })} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{field.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={field.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="flex flex-row gap-1 absolute bottom-3">
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button type="button">close</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
