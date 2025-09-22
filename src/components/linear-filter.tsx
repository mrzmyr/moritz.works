"use client";

import { useCallback, useEffect, useState } from "react";
import { parseFilterAction } from "@/app/blog/linear-filter/actions";
import { FilterType, type ParsedFilter } from "@/app/blog/linear-filter/types";
import { FilterPill, RootFilterDropdown } from "./linear-filter-pill";
import { Skeleton } from "./ui/skeleton";

export function LinearFilter({
  onFiltersChange,
}: {
  onFiltersChange: (filters: ParsedFilter | null) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>({
    conditions: [
      {
        name: "Label",
        type: FilterType.LABEL,
        operator: "not_include",
        value: ["bug", "feature"],
        selectedValue: [],
      },
      {
        name: "Status",
        type: FilterType.STATUS,
        operator: "equals",
        value: ["done"],
        selectedValue: [],
      },
    ],
    raw_input: "label not includes bug or feature and status done",
  });

  // Sync parsed filters with parent component
  useEffect(() => {
    onFiltersChange(parsedFilters);
  }, [parsedFilters, onFiltersChange]);

  const parse = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setParsedFilters(null);

    try {
      const result = await parseFilterAction(q);

      if (!result.success) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
        return;
      }

      setParsedFilters(result.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasFilters = !!parsedFilters?.conditions?.length;

  return (
    <div className="h-[28px] flex items-center">
      {!hasFilters && !isLoading && (
        <RootFilterDropdown onSelect={parse} shouldShake={shouldShake} />
      )}

      {isLoading && (
        <div className="flex flex-row gap-2 flex-wrap">
          <Skeleton
            className="w-[180px] h-7"
            style={{ animationDelay: "0ms" }}
          />
          <Skeleton
            className="w-[100px] h-7"
            style={{ animationDelay: "120ms" }}
          />
          <Skeleton
            className="w-[140px] h-7"
            style={{ animationDelay: "240ms" }}
          />
        </div>
      )}

      {hasFilters && parsedFilters && (
        <div className="flex flex-row gap-2 flex-wrap">
          {parsedFilters.conditions.map((condition, idx) => (
            <FilterPill
              key={`${condition.type}-${condition.operator}-${idx}`}
              filter={condition}
              onRemove={(toRemove) => {
                setParsedFilters((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    conditions: prev.conditions.filter((c) => c !== toRemove),
                  };
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
