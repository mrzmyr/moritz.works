import z from "zod";

export enum FilterType {
	DATE = "date",
	LABEL = "label",
	STATUS = "status",
}

export const FILTER_PLURAL_NAMES = {
	[FilterType.DATE]: "dates",
	[FilterType.LABEL]: "labels",
	[FilterType.STATUS]: "statuses",
};

const dateFilter = z.object({
	name: z.literal("Date"),
	type: z.literal(FilterType.DATE),
	operator: z.enum(["before", "after"]),
	value: z.string(),
	selectedValue: z.array(z.string()),
	unit: z.enum(["days", "weeks", "months", "years"]).nullable(),
});

export type DateFilter = z.infer<typeof dateFilter>;

const labelValues = z.enum(["bug", "feature", "customer-support"]);

const labelFilter = z.object({
	name: z.literal("Label"),
	type: z.literal(FilterType.LABEL),
	operator: z.enum(["include", "not_include"]),
	value: z.array(labelValues),
	selectedValue: z.array(labelValues),
});

export type LabelFilter = z.infer<typeof labelFilter>;

const statusValues = z.enum(["todo", "in_progress", "done"]);

const statusFilter = z.object({
	name: z.literal("Status"),
	type: z.literal(FilterType.STATUS),
	operator: z.enum(["equals"]),
	value: z.array(statusValues),
	selectedValue: z.array(statusValues),
});

export type StatusFilter = z.infer<typeof statusFilter>;

const filterCondition = z.discriminatedUnion("type", [
	dateFilter,
	labelFilter,
	statusFilter,
]);

export type FilterCondition = z.infer<typeof filterCondition>;

export const parsedFilter = z.object({
	conditions: z.array(filterCondition),
	raw_input: z.string(),
});

export type ParsedFilter = z.infer<typeof parsedFilter>;
