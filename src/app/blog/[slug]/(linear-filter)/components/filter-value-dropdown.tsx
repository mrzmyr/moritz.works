"use client";

import { useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FILTER_PLURAL_NAMES, type FilterCondition } from "../types";
import { capitalize } from "../utils";
import { MiniCheckbox } from "./mini-checkbox";
import { ITEMS_BY_TYPE } from "./shared";

export const FilterValueDropdown = ({
  filter,
  onChange,
  children,
}: {
  filter: FilterCondition;
  onChange: (filter: FilterCondition) => void;
  children: React.ReactNode;
}) => {
  const title = capitalize(FILTER_PLURAL_NAMES[filter.type]);
  const items = ITEMS_BY_TYPE[filter.type];

  const [open, setOpen] = useState(false);
  const selectedItems = filter.value as string[];

  const onSelect = (value: string) => {
    const newSelectedItems = selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];

    onChange({ ...filter, value: newSelectedItems as never });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "px-1.5 h-5 has-[>svg]:px-1.5 font-normal hover:bg-neutral-100 dark:hover:bg-neutral-700",
            open && "bg-neutral-100"
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={title} className="h-9" />
          <CommandList>
            <CommandGroup>
              {items.map(({ value, icon, title }) => (
                <CommandItem
                  key={value}
                  value={value}
                  className="group"
                  onSelect={() => onSelect(value)}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <MiniCheckbox checked={selectedItems.includes(value)} />
                    {icon}
                    <span className="text-[13px]">{title}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
