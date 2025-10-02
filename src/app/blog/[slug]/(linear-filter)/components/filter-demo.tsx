"use client";

import type { ParsedFilter } from "../schema";
import { Filter } from "./filter";

export function FilterDemo({
  initialFilters,
}: {
  initialFilters?: ParsedFilter | null;
} = {}) {
  return <Filter onChange={() => {}} initialFilters={initialFilters} />;
}
