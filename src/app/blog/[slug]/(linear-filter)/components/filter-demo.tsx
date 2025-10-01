"use client";

import type { ParsedFilter } from "../types";
import { Filter } from "./filter";

export function FilterDemo({
	initialFilters,
}: {
	initialFilters?: ParsedFilter | null;
} = {}) {
	return <Filter onChange={() => {}} initialFilters={initialFilters} />;
}
