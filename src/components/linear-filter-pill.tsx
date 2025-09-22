import { motion, type Variants } from "framer-motion";
import { CalendarIcon, Check, ListFilter, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  FilterCondition,
  ParsedFilter,
} from "@/app/blog/linear-filter/types";
import {
  FILTER_PLURAL_NAMES,
  FilterType,
} from "@/app/blog/linear-filter/types";
import { capitalize } from "@/app/blog/linear-filter/utils";
import { cn } from "@/lib/utils";
import {
  AiFilterIcon,
  AssigneeIcon,
  DateIcon,
  DoneIcon,
  InProgressIcon,
  LabelIcon,
  StatusIcon,
  TodoIcon,
} from "../app/blog/linear-filter/icons";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

/* ----------------------------- Types & Data ----------------------------- */

type DropdownItem = { value: string; title: string; icon: React.ReactNode };

const ITEMS_BY_TYPE: Record<FilterType, DropdownItem[]> = {
  date: [
    { value: "1 month ago", title: "1 month ago", icon: <CalendarIcon /> },
    { value: "3 months ago", title: "3 months ago", icon: <CalendarIcon /> },
    { value: "6 months ago", title: "6 months ago", icon: <CalendarIcon /> },
  ],
  label: [
    {
      value: "bug",
      title: "bug",
      icon: (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#eb5757]" />
      ),
    },
    {
      value: "feature",
      title: "feature",
      icon: (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" />
      ),
    },
    {
      value: "customer-support",
      title: "customer-support",
      icon: (
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#26b5ce]" />
      ),
    },
  ],
  status: [
    { value: "todo", title: "Todo", icon: <TodoIcon /> },
    { value: "in progress", title: "In Progress", icon: <InProgressIcon /> },
    { value: "done", title: "Done", icon: <DoneIcon /> },
  ],
};

const DISPLAY_MAP = {
  [FilterType.DATE]: { icon: <DateIcon />, label: "Created Date" },
  [FilterType.LABEL]: { icon: <LabelIcon />, label: "Label" },
  [FilterType.STATUS]: { icon: <StatusIcon />, label: "Status" },
} as const;

const OPERATOR_LABELS: Record<FilterCondition["operator"], string> = {
  before: "before",
  after: "after",
  include: "include",
  not_include: "not include",
  equals: "equals",
};

const PillSegment = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-row gap-1.5 items-center px-1.5 py-0.5",
      className
    )}
  >
    {children}
  </div>
);

const MiniCheckbox = ({ checked }: { checked: boolean }) => (
  <div
    className={cn(
      "w-3.5 h-3.5 rounded-[3px] group-hover:bg-white flex items-center justify-center",
      checked
        ? "bg-[#5e6ad2] group-hover:bg-[#5e6ad2]"
        : "bg-white text-gray-200 group-hover:bg-white group-hover:outline-1 group-hover:outline-neutral-400"
    )}
  >
    {checked && <Check className="w-3.5 h-3.5 text-white" />}
  </div>
);

const Divider = () => <div className="w-px h-5 bg-gray-200" />;

const TERMS = [
  { value: "Status", icon: <StatusIcon /> },
  { value: "Assignee", icon: <AssigneeIcon /> },
  { value: "Created", icon: <DateIcon /> },
  { value: "Label", icon: <LabelIcon /> },
];

export function RootFilterDropdown({
  onSelect,
  shouldShake,
}: {
  onSelect: (value: string) => void;
  shouldShake?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((t) => t.value.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (shouldShake) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  const shakeVariants: Variants = {
    shake: {
      x: [-8, 8, -8, 8, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    static: {
      x: 0,
    },
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          variants={shakeVariants}
          animate={isShaking ? "shake" : "static"}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            "hover:bg-accent hover:text-accent-foreground",
            "px-1.5 h-7 has-[>svg]:px-1.5 font-normal",
            open && "bg-neutral-100"
          )}
          aria-expanded={open}
        >
          <ListFilter className="w-3 h-3" />
          Filter…
        </motion.button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Filter…"
            className="h-9"
            onValueChange={(v) => setQuery(v)}
          />
          <CommandList>
            <CommandGroup>
              {filtered.map((t) => (
                <CommandItem
                  key={t.value}
                  value={t.value}
                  disabled
                  className="opacity-60"
                >
                  <div className="flex items-center gap-2">
                    {t.icon}
                    {t.value}
                  </div>
                  {/* purely visual checkmark; items are disabled (non-selectable) */}
                  <Check className="ml-auto opacity-0" />
                </CommandItem>
              ))}

              <CommandItem
                value="ai_filter"
                onSelect={() => {
                  onSelect(query.trim());
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  <AiFilterIcon />
                  <span>AI Filter</span>
                  {query.trim() && (
                    <span className="text-muted-foreground">
                      &quot;{query.trim()}&quot;
                    </span>
                  )}
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const FilterDropdown = ({
  items,
  title,
  selectedItems,
  children,
}: {
  items: DropdownItem[];
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
            "px-1.5 h-5 has-[>svg]:px-1.5 font-normal hover:bg-neutral-100",
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

const FilterTypeBadge = ({ type }: { type: FilterCondition["type"] }) => {
  const { icon, label } = DISPLAY_MAP[type];
  return (
    <PillSegment>
      {icon}
      <span>{label}</span>
    </PillSegment>
  );
};

const FilterOperatorBadge = ({
  operator,
}: {
  operator: FilterCondition["operator"];
}) => (
  <PillSegment className="text-neutral-600 cursor-default">
    {OPERATOR_LABELS[operator]}
  </PillSegment>
);

const FilterValueSelector = ({ filter }: { filter: FilterCondition }) => {
  const subItems = ITEMS_BY_TYPE[filter.type];

  // Date (single string)
  if (filter.type === FilterType.DATE && typeof filter.value === "string") {
    return (
      <button
        type="button"
        onClick={() => toast("Not implemented 🤫")}
        className="flex gap-1.5 items-center px-1.5 py-0.5 hover:bg-neutral-100"
      >
        {new Date(filter.value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </button>
    );
  }

  // Label/Status (multi-select)
  if (
    [FilterType.STATUS, FilterType.LABEL].includes(filter.type) &&
    Array.isArray(filter.value)
  ) {
    const selected = subItems.filter((i) =>
      filter.value.includes(i.value as never)
    );
    return (
      <FilterDropdown
        items={subItems}
        title={capitalize(FILTER_PLURAL_NAMES[filter.type])}
        selectedItems={filter.value}
      >
        <PillSegment>
          <div className="flex -space-x-[0px] [&>*]:outline-1 [&>*]:outline-white">
            {selected.map((i) => (
              <span key={i.value} className="inline-flex">
                {i.icon}
              </span>
            ))}
          </div>
          <span>
            {selected.length === 1
              ? selected[0].title
              : `${selected.length} ${FILTER_PLURAL_NAMES[filter.type]}`}
          </span>
        </PillSegment>
      </FilterDropdown>
    );
  }

  return <div>Unsupported filter type</div>;
};

export const FilterPill = ({
  filter,
  onRemove,
}: {
  filter: ParsedFilter["conditions"][number];
  onRemove: (filter: ParsedFilter["conditions"][number]) => void;
}) => {
  return (
    <div className="flex flex-row text-xs items-center border border-gray-200 rounded-sm max-w-fit overflow-hidden">
      <FilterTypeBadge type={filter.type} />
      <Divider />
      <FilterOperatorBadge operator={filter.operator} />
      <Divider />
      <FilterValueSelector filter={filter} />
      <Divider />
      <button
        type="button"
        className="px-1.5 py-1 hover:bg-gray-100 hover:text-foreground"
        onClick={() => onRemove(filter)}
        aria-label="Remove filter"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};
