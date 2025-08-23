"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a filter parser for a Linear-like issue tracking system. 
Parse natural language filter descriptions into structured JSON format.

If you see multiple consititions, return an array of conditions.

Examples: 

- "bugs older than 3 months" (label: include, value: bug; date: before, value: 3, unit: months)
- "label not includes bug and status done" (label: not_include, value: bug, status: equals, value: done)

If the user asks for a filter that is not possible, return an empty array.
`;

const dateFilter = z.object({
	type: z.literal("date"),
	operator: z.enum(["before", "after"]),
	value: z.string(),
	unit: z.enum(["days", "weeks", "months", "years"]).nullable(),
});

export type DateFilter = z.infer<typeof dateFilter>;

const labelFilter = z.object({
	type: z.literal("label"),
	operator: z.enum(["include", "not_include"]),
	value: z.array(z.string()),
});

export type LabelFilter = z.infer<typeof labelFilter>;

const statusFilter = z.object({
	type: z.literal("status"),
	operator: z.enum(["equals"]),
	value: z.array(z.enum(["todo", "in_progress", "done"])),
});

export type StatusFilter = z.infer<typeof statusFilter>;

const filterCondition = z.discriminatedUnion("type", [
	dateFilter,
	labelFilter,
	statusFilter,
]);

export type FilterCondition = z.infer<typeof filterCondition>;

const parsedFilter = z.object({
	conditions: z.array(filterCondition),
	raw_input: z.string(),
});

export type ParsedFilter = z.infer<typeof parsedFilter>;

export async function parseFilterAction(input: string): Promise<
	| {
			success: true;
			data: ParsedFilter;
	  }
	| {
			success: false;
			error: string;
	  }
> {
	if (!input?.trim()) {
		return { success: false, error: "Input is required" };
	}

	try {
		const completion = await openai.chat.completions.parse({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: input },
			],
			response_format: zodResponseFormat(parsedFilter, "parsed_filter"),
		});

		const parsed_filter = completion.choices[0].message.parsed;

		if (!parsed_filter) {
			return { success: false, error: "Failed to parse filter" };
		}

		return { success: true, data: parsed_filter };
	} catch (error) {
		console.error("Error parsing filter:", error);
		return { success: false, error: "Failed to parse filter" };
	}
}
