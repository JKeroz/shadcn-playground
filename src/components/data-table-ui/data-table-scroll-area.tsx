"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

type SizeType = 'rem' | 'px'
type HeightOrWidth = 'h' | 'w' | 'max-h' | 'max-w'
type SizeCss = `${number}${SizeType}`
type CustomTailwindSizeCss = `${HeightOrWidth}-[${SizeCss}]`

const DataTableScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & { 
    viewPortClassName: string
  }
>(({ className, children, viewPortClassName, ...props }, ref) => {
  console.log({viewPortClassName})
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(`rounded-[inherit]`, viewPortClassName)}
      >     
        {children} 
      </ScrollAreaPrimitive.Viewport>
      <DataTableScrollBar orientation="vertical" className=""/>
      <DataTableScrollBar orientation="horizontal" className=""/>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
DataTableScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const DataTableScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
DataTableScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { DataTableScrollArea, DataTableScrollBar }
