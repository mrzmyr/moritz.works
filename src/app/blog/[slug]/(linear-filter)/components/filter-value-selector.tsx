"use client";

import type { FilterCondition } from "../schema";
import { FILTER_PLURAL_NAMES, FilterType } from "../types";
import { FilterValueDropdown } from "./filter-value-dropdown";
import { PillSegment } from "./pill-segment";
import { ITEMS_BY_TYPE } from "./shared";

export const FilterValueSelector = ({
  filter,
  onChange = () => {},
}: {
  filter: FilterCondition;
  onChange?: (filter: FilterCondition) => void;
}) => {
  // Date (single string)
  if (filter.type === FilterType.DATE && typeof filter.value === "string") {
    return (
      <button
        type="button"
        className="flex gap-1.5 items-center px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs"
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
    const selected = ITEMS_BY_TYPE[filter.type].filter((i) =>
      filter.value.includes(i.value as never),
    );
    return (
      <FilterValueDropdown filter={filter} onChange={onChange}>
        <PillSegment>
          <div className="flex -space-x-[0px] [&>*]:outline-1 [&>*]:outline-white dark:[&>*]:outline-transparent">
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
      </FilterValueDropdown>
    );
  }

  return <div>Unsupported filter type</div>;
};
