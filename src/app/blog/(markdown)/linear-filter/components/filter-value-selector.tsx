import { toast } from "sonner";
import type { FilterCondition } from "@/app/blog/(markdown)/linear-filter/types";
import {
  FILTER_PLURAL_NAMES,
  FilterType,
} from "@/app/blog/(markdown)/linear-filter/types";
import { capitalize } from "@/app/blog/(markdown)/linear-filter/utils";
import { FilterValueDropdown } from "./filter-value-dropdown";
import { PillSegment } from "./pill-segment";
import { ITEMS_BY_TYPE } from "./shared";

export const FilterValueSelector = ({
  filter,
}: {
  filter: FilterCondition;
}) => {
  const subItems = ITEMS_BY_TYPE[filter.type];

  // Date (single string)
  if (filter.type === FilterType.DATE && typeof filter.value === "string") {
    return (
      <button
        type="button"
        onClick={() => toast("Not implemented 🤫")}
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
    const selected = subItems.filter((i) =>
      filter.value.includes(i.value as never)
    );
    return (
      <FilterValueDropdown
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
      </FilterValueDropdown>
    );
  }

  return <div>Unsupported filter type</div>;
};
