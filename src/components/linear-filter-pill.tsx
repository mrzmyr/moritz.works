import {
  FilterCondition,
  ParsedFilter,
} from "@/app/blog/linear-filter/actions";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { DateIcon, LabelIcon, StatusIcon } from "./linear-icons";

const PillSlice = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center px-1.5 py-0.5",
        className
      )}
    >
      {children}
    </div>
  );
};

const FilterDisplayType = ({ type }: { type: FilterCondition["type"] }) => {
  return (
    <PillSlice>
      {type === "date" && (
        <div className="flex flex-row gap-2 items-center">
          <DateIcon />
          <span>Created Date</span>
        </div>
      )}
      {type === "label" && (
        <div className="flex flex-row gap-2 items-center">
          <LabelIcon />
          <span>Label</span>
        </div>
      )}
      {type === "status" && (
        <div className="flex flex-row gap-2 items-center">
          <StatusIcon />
          <span>Status</span>
        </div>
      )}
    </PillSlice>
  );
};

const FilterDisplayOperator = ({
  operator,
}: {
  operator: FilterCondition["operator"];
}) => {
  return (
    <PillSlice className="text-neutral-600">
      {operator === "before" && <span>before</span>}
      {operator === "after" && <span>after</span>}
      {operator === "include" && <span>include</span>}
      {operator === "not_include" && <span>not include</span>}
      {operator === "equals" && <span>equals</span>}
    </PillSlice>
  );
};

const FilterDisplayValue = ({ filter }: { filter: FilterCondition }) => {
  return (
    <PillSlice>
      {Array.isArray(filter.value)
        ? filter.value.map((v) => v).join(", ")
        : filter.value}{" "}
      {filter.type === "date" && "months ago"}
    </PillSlice>
  );
};

const Separator = () => {
  return <div className="w-px h-5 bg-gray-200" />;
};

export const LinearFilterPill = ({
  filter,
  onRemove,
}: {
  filter: ParsedFilter["conditions"][number];
  onRemove: (filter: ParsedFilter["conditions"][number]) => void;
}) => {
  return (
    <div className="flex flex-row text-xs items-center border border-gray-200 rounded-sm max-w-fit overflow-hidden">
      <FilterDisplayType type={filter.type} />
      <Separator />
      <FilterDisplayOperator operator={filter.operator} />
      <Separator />
      <FilterDisplayValue filter={filter} />
      <Separator />
      <div
        className="px-1.5 py-1 hover:bg-gray-100 hover:text-foreground"
        onClick={() => onRemove(filter)}
      >
        <XIcon className="w-3 h-3" />
      </div>
    </div>
  );
};
