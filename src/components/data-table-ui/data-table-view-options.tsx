import * as React from "react";
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
import { Column } from "@tanstack/react-table";

/**
 * Props for Table view optiionscomponent
 */
interface TableViewOptionsProps<TData>
  extends React.HTMLAttributes<HTMLDivElement>
{
  columns: Column<TData, unknown>[]
  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;
}

export function TableViewOptions<TData>({
  columns,
  modalPopover = true,
  className,
}: TableViewOptionsProps<TData> ) {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const toggleOption = (column: Column<TData>) => {
      column.toggleVisibility(!column.getIsVisible())
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const toggleAll = () => {
      columns.map((column) => column.toggleVisibility(!column.getIsVisible()))
    };

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
              "flex ml-auto h-8",
              className
            )}
          >
            <MixerHorizontalIcon className="mr-2 size-4" />
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
                // onKeyDown={handleInputKeyDown}
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
                        columns.every((column) => column.getIsVisible())
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
                    {columns.map((column) => {
                      const isSelected = column.getIsVisible()
                      return (
                        <CommandItem
                          key={column.id}
                          onSelect={() => toggleOption(column)}
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
                          <span className="capitalize">{column.id}</span>
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