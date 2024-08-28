"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { getActionsColumn } from "@/components/data-table-ui/data-table-actions-column";
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
  extra_column_1: z.string().optional(),
  extra_column_2: z.string().optional(),
  extra_column_3: z.string().optional(),
  extra_column_4: z.string().optional(),
  extra_column_5: z.string().optional(),
})

const InsertProductSchema = ProductSchema.omit({ id: true, created_at: true, updated_at: true })

export type Product = z.infer<typeof ProductSchema>
export type InsertProduct = z.infer<typeof InsertProductSchema>

export function getProductColumns() {
  const columnHelper = createColumnHelper<Product>()
  return [
    getActionsColumn<Product>(),
    columnHelper.accessor('id', { 
      header: 'ID',
      enableHiding: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('name', { 
      header: 'Name',
    }),
    columnHelper.accessor('description', { 
      header: 'Description',
      size: 800,
      maxSize: 800,
    }),
    columnHelper.accessor('price', { 
      header: 'Price',
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
    }),
    columnHelper.accessor('stock_quantity', { 
      header: 'Stock Quantity',
    }),
    columnHelper.accessor('category', { 
      header: 'Category',
    }),
    columnHelper.accessor('sku', { 
      header: 'SKU',
    }),
    columnHelper.accessor('extra_column_1', { 
      header: 'ExtraColumn1',
      enableColumnFilter: false,
    }),
    columnHelper.accessor('extra_column_2', { 
      header: 'ExtraColumn2',
      enableColumnFilter: false,
    }),
    columnHelper.accessor('extra_column_3', { 
      header: 'ExtraColumn3',
      enableColumnFilter: false,
    }),
    columnHelper.accessor('extra_column_4', { 
      header: 'ExtraColumn4',
      enableColumnFilter: false,
    }),
    columnHelper.accessor('extra_column_5', { 
      header: 'ExtraColumn5',
      enableColumnFilter: false,
    }),
  ]
}
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
