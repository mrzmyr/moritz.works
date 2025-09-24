import { useState } from "react";
import { toast } from "sonner";
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
import { MiniCheckbox } from "./mini-checkbox";
import type { FilterValueDropdownItem } from "./shared";

export const FilterValueDropdown = ({
  items,
  title,
  selectedItems,
  children,
}: {
  items: FilterValueDropdownItem[];
  title: string;
  selectedItems: string[];
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

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
                  onSelect={() => toast("Not implemented 🤫")}
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
