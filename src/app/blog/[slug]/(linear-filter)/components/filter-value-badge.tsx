"use client";

import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { FILTER_PLURAL_NAMES } from "../config";
import type { FilterCondition } from "../schema";
import { FilterType } from "../types";
import { FilterValueDropdown } from "./filter-value-dropdown";
import { ITEMS_BY_TYPE } from "./shared";

const GIF_UFO = "https://imgur.com/e4QEwuV.gif";

export const FilterValueBadge = ({
  filter,
  onChange = null,
}: {
  filter: FilterCondition;
  onChange?: ((filter: FilterCondition) => void) | null;
}) => {
  const controls = useAnimation();

  // Date (single string)
  if (filter.type === FilterType.DATE && typeof filter.value === "string") {
    const handleDateClick = async () => {
      await controls.start({
        x: [0, -2, 2, -2, 0],
        transition: { duration: 0.2, times: [0, 0.2, 0.8, 1] },
      });
    };

    return (
      <motion.button
        type="button"
        className={cn(
          "flex flex-row gap-1.5 items-center px-1.5 py-0.5",
          "h-5 has-[>svg]:px-1.5 font-normal",
          "bg-white hover:bg-neutral-100",
          "dark:bg-neutral-800 dark:hover:bg-neutral-700",
        )}
        onClick={handleDateClick}
        animate={controls}
      >
        {new Date(filter.value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </motion.button>
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
      <FilterValueDropdown filter={filter} onChange={onChange ?? (() => {})}>
        <div className="flex -space-x-[0px]">
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
      </FilterValueDropdown>
    );
  }

  return <div>Unsupported filter type</div>;
};
