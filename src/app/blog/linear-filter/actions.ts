"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT } from "./config";
import { type ParsedFilter, parsedFilter } from "./types";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

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
