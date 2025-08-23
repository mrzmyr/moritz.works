"use client";

import {
	type ParsedFilter,
	parseFilterAction,
} from "@/app/blog/linear-filter/actions";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ListFilter } from "lucide-react";
import { useCallback, useState } from "react";
import { LinearFilterPill } from "./linear-filter-pill";
import {
	AiFilterIcon,
	AssigneeIcon,
	DateIcon,
	LabelIcon,
	StatusIcon,
} from "./linear-icons";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const terms = [
	{
		value: "Status",
		icon: <StatusIcon />,
	},
	{
		value: "Assignee",
		icon: <AssigneeIcon />,
	},
	{
		value: "Created At",
		icon: <DateIcon />,
	},
	{
		value: "Label",
		icon: <LabelIcon />,
	},
];

export function FilterDropdown({
	onSelect,
}: {
	onSelect: (value: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [filterValue, setFilterValue] = useState("");

	const [filteredItems, setFilteredItems] = useState(terms);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					aria-expanded={open}
					className={cn(
						"px-1.5 h-7 has-[>svg]:px-1.5 font-normal",
						open && "bg-neutral-100",
					)}
				>
					<ListFilter className="w-3 h-3" />
					Filter…
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Filter…"
						className="h-9"
						onValueChange={(value) => {
							setFilterValue(value.trim());
							setFilteredItems(
								terms.filter((term) =>
									term.value.toLowerCase().includes(value.toLowerCase()),
								),
							);
						}}
					/>
					<CommandList>
						<CommandGroup>
							{filteredItems.map((term) => (
								<CommandItem
									key={term.value}
									value={term.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<div className="flex flex-row gap-2 items-center">
										{term.icon}
										{term.value}
									</div>
									<Check
										className={cn(
											"ml-auto",
											value === term.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
							<CommandItem
								value="ai_filter"
								onSelect={() => onSelect(filterValue)}
							>
								<div className="flex flex-row gap-2 items-center">
									<AiFilterIcon />
									<span>AI Filter</span>
									{filterValue && (
										<span className="text-muted-foreground">
											"{filterValue}"
										</span>
									)}
								</div>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export function LinearFilter({
	onFiltersChange,
}: {
	onFiltersChange: (filters: ParsedFilter | null) => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>({
		conditions: [
			{
				type: "label",
				operator: "not_include",
				value: ["bug", "feature"],
			},
			{
				type: "status",
				operator: "equals",
				value: ["done"],
			},
		],
		raw_input: "label not includes bug or feature and status done",
	});

	const onSelect = (newQuery: string) => {
		parse(newQuery);
	};

	const parse = useCallback(
		async (query: string) => {
			setIsLoading(true);

			setParsedFilters(null);
			onFiltersChange(null);

			const result = await parseFilterAction(query);

			if (result.success) {
				setParsedFilters(result.data);
				onFiltersChange(result.data);
			}

			setIsLoading(false);
		},
		[onFiltersChange],
	);

	const hasFilters = parsedFilters && parsedFilters.conditions.length > 0;

	return (
		<div>
			{!hasFilters && !isLoading && <FilterDropdown onSelect={onSelect} />}

			{isLoading && (
				<div className="flex flex-row gap-2 flex-wrap">
					<Skeleton className="w-[200px] h-7" />
					<Skeleton className="w-[200px] h-7" />
				</div>
			)}

			{hasFilters && (
				<div className="flex flex-row gap-2 flex-wrap">
					{parsedFilters.conditions.map((condition) => (
						<LinearFilterPill
							key={condition.type}
							filter={condition}
							onRemove={(filter) => {
								const newFilters = {
									...parsedFilters,
									conditions: parsedFilters.conditions.filter(
										(c) => c.type !== filter.type,
									),
								};

								setParsedFilters(newFilters);
								onFiltersChange(newFilters);
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
