import type { ParsedFilter } from "@/app/blog/(markdown)/linear-filter/types";
import { Divider } from "./divider";
import { FilterClose } from "./filter-close";
import { FilterOperator } from "./filter-operator";
import { FilterTypeBadge } from "./filter-type-badge";
import { FilterValueSelector } from "./filter-value-selector";

export const FilterPill = ({
  filter,
  onRemove,
}: {
  filter: ParsedFilter["conditions"][number];
  onRemove: (filter: ParsedFilter["conditions"][number]) => void;
}) => {
  return (
    <div className="flex flex-row text-xs items-center border border-neutral-200 dark:border-neutral-700 rounded-sm max-w-fit overflow-hidden">
      <FilterTypeBadge type={filter.type} />
      <Divider />
      <FilterOperator operator={filter.operator} />
      <Divider />
      <FilterValueSelector filter={filter} />
      <Divider />
      <FilterClose onClick={() => onRemove(filter)} />
    </div>
  );
};
