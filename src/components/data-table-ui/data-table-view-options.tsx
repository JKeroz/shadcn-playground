import { useState, type Dispatch, HTMLAttributes, useCallback, useMemo } from "react";
import {
  CheckIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { CustomTableState, SetTableState } from "@/components/data-table";

/**
 * Props for Table view optiionscomponent
 */
interface TableViewOptionsProps<TData>
  extends HTMLAttributes<HTMLDivElement>
{
  columns: ColumnDef<TData, unknown>[]
  setColumnVisibility: SetTableState<'columnVisibility'>
  columnVisibilityState: CustomTableState['columnVisibility']
  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;
}

export function TableViewOptions<TData>({
  columns,
  setColumnVisibility,
  columnVisibilityState,
  modalPopover = true,
  className,
}: TableViewOptionsProps<TData> ) { 
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const filteredColumns = useMemo(() => columns.filter((column) => (!column.meta?.isUtilityColumn && (column.enableHiding === undefined || column.enableHiding === true))), [columns])

    const toggleOption = (value: VisibilityState) => {
      setColumnVisibility({ columnVisibility: { ...value } })
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const toggleAll = () => {
      const newVisibleColumns = filteredColumns.reduce((acc, column) => {
        if ('accessorKey' in column && typeof column.accessorKey === 'string') {
          Object.assign(acc, { [column.accessorKey]: true })
        }
        return acc
      }, {} as VisibilityState)
      setColumnVisibility({ columnVisibility: { ...newVisibleColumns } })
    };

    const getIsColumnVisible = useCallback((column: ColumnDef<TData, unknown>) => {
      if (!columnVisibilityState) return false
      if ('accessorKey' in column && typeof column.accessorKey === 'string' && typeof columnVisibilityState !== 'function') {
        if (!Object.hasOwn(columnVisibilityState, column.accessorKey)) {
          return true
        }

        const visibilityState = columnVisibilityState[column.accessorKey]
        return visibilityState
      }

      return false
    }, [columnVisibilityState])

    if (!columnVisibilityState) return null

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            onClick={handleTogglePopover}
            aria-label="Toggle columns"
            variant="outline"
            size="sm"
            className={cn(
              className ? className : "h-7 gap-1 text-sm"
            )}
          >
            <MixerHorizontalIcon className="h-3.5 w-3.5" />
            View
          </Button>
        </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="end"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          > 
            <Command>
              <CommandInput
                placeholder="Search..."
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer sticky top-0"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        filteredColumns.every((column) => getIsColumnVisible(column))
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>Select All</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <ScrollArea className="h-48">
                  <CommandGroup>
                    {filteredColumns.map((column, index) => {
                        const isAccesorKeyInColumn = 'accessorKey' in column && typeof column.accessorKey === 'string'
                        if (!isAccesorKeyInColumn) return null

                        const isSelected = getIsColumnVisible(column)
                        const key = column.accessorKey
                        
                        return (
                          <CommandItem
                            key={index}
                            onSelect={() => toggleOption({ [key]: !isSelected })}
                            className="cursor-pointer"
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </div>
                            <span className="capitalize">{column.id ?? column.header?.toString()}</span>
                          </CommandItem>
                        );
                    })}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </Command>
          </PopoverContent>
      </Popover>
    );
}