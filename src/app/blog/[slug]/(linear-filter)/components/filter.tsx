"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseFilterAction } from "../actions";
import { EXAMPLE_ISSUES } from "../config";
import type { ParsedFilter } from "../schema";
import { FilterDropdown } from "./filter-dropdown";
import { FilterPill } from "./filter-pill";
import { IssueList } from "./issue-list";

export function Filter({
  onChange = () => {},
  initialFilters,
}: {
  onChange?: (filters: ParsedFilter | null) => void;
  initialFilters?: ParsedFilter | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>(
    initialFilters || null,
  );

  // Sync parsed filters with parent component
  useEffect(() => {
    onChange(parsedFilters);
  }, [parsedFilters, onChange]);

  const parse = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setParsedFilters(null);

    try {
      const result = await parseFilterAction(q);

      if (!result.success || !result) {
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
    <div className="flex flex-col items-start w-full no">
      <div className="w-full pt-3 px-3 min-h-10">
        {!hasFilters && !isLoading && (
          <FilterDropdown onSelect={parse} shouldShake={shouldShake} />
        )}

        {isLoading && (
          <div className="flex flex-row gap-2 flex-wrap">
            <Skeleton className="w-[180px] h-7 duration-[2s] delay-0 bg-neutral-200 dark:bg-card" />
            <Skeleton className="w-[100px] h-7 duration-[2s] delay-500 bg-neutral-200 dark:bg-card" />
            <Skeleton className="w-[140px] h-7 duration-[2s] delay-1000 bg-neutral-200 dark:bg-card" />
          </div>
        )}

        {hasFilters && parsedFilters && (
          <div className="flex flex-row gap-2 flex-wrap">
            {parsedFilters.conditions.map((condition, idx) => (
              <FilterPill
                key={`${condition.type}-${condition.operator}-${idx}`}
                filter={condition}
                onChange={(updated) => {
                  const newConditions = parsedFilters?.conditions.map((c) =>
                    c === condition ? updated : c,
                  );

                  setParsedFilters((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      conditions: newConditions,
                    };
                  });
                }}
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

      <div className="w-full h-[1px] mt-2 bg-neutral-200 dark:bg-neutral-900 rounded-sm" />

      <div className="w-full">
        <IssueList filters={parsedFilters} issues={EXAMPLE_ISSUES} />
      </div>
    </div>
  );
}
