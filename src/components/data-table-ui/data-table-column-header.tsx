'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons"
import { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, PinIcon, PinOff, PinOffIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [ pinColor, setPinColor] = useState("#7c3aed")
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    if (theme === 'light' || (theme === 'system' && systemTheme === 'light')) {
      setPinColor("#7c3aed")
    }
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
      setPinColor("#26a172")
    }
  }, [theme, systemTheme, setPinColor])

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex align-middle justify-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            { column.getIsPinned() 
              ? 
                (
                  <>
                    <DropdownMenuItem onClick={() => column.pin(false)}>
                      <PinOffIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                      Unpin
                    </DropdownMenuItem>
                  </>
                )
              : 
                (
                  <>
                  <DropdownMenuSubTrigger>
                    <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Pin
                  </DropdownMenuSubTrigger><DropdownMenuSubContent className="p-0">
                    <DropdownMenuItem onClick={() => column.pin('left')}>
                      <ChevronLeft className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                      Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.pin('right')}>
                      <ChevronRight className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                      Right
                    </DropdownMenuItem>
                  </DropdownMenuSubContent></>
                )
          }
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      { column.getIsPinned() ? <PinIcon color={pinColor} className="h-4 w-4 absolute top-1 right-1" /> : null }
    </div>
  )
}