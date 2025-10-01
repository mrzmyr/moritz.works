"use client";

import type { ParsedFilter } from "../types";
import { Divider } from "./divider";
import { FilterClose } from "./filter-close";
import { FilterOperator } from "./filter-operator";
import { FilterTypeBadge } from "./filter-type-badge";
import { FilterValueSelector } from "./filter-value-selector";

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
		<div className="flex flex-row text-xs items-center border border-neutral-200 dark:border-neutral-700 rounded-sm max-w-fit overflow-hidden cursor-default">
			<FilterTypeBadge type={filter.type} />
			<Divider />
			<FilterOperator operator={filter.operator} />
			<Divider />
			<FilterValueSelector filter={filter} onChange={onChange} />
			<Divider />
			<FilterClose onClick={() => onRemove(filter)} />
		</div>
	);
};
