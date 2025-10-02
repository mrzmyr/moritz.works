"use client";

import type { ParsedFilter } from "../schema";
import { Divider } from "./divider";
import { FilterClose } from "./filter-close";
import { FilterOperatorBagde } from "./filter-operator-badge";
import { FilterTypeBadge } from "./filter-type-badge";
import { FilterValueBadge } from "./filter-value-badge";

export const FilterPill = ({
  filter,
  onChange = () => {},
  onRemove = () => {},
}: {
  filter: ParsedFilter["conditions"][number];
  onChange?: (filter: ParsedFilter["conditions"][number]) => void;
  onRemove?: (filter: ParsedFilter["conditions"][number]) => void;
}) => {
  return (
    <div className="flex flex-row text-xs items-center rounded-sm max-w-fit overflow-hidden cursor-default border border-border dark:border-transparent select-none">
      <FilterTypeBadge type={filter.type} />
      <Divider />
      <FilterOperatorBagde operator={filter.operator} />
      <Divider />
      <FilterValueBadge filter={filter} onChange={onChange} />
      <Divider />
      <FilterClose onClick={() => onRemove(filter)} />
    </div>
  );
};
