"use client";

import { useCallback, useState } from "react";
import { CopyToClipboard } from "@/components/copy-to-clipboard";
import { DemoBox } from "@/components/demo-box";
import { LinearFilter } from "@/components/linear-filter";
import { PageBack } from "@/components/page-back";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import {
	type BundledLanguage,
	CodeBlock,
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockFilename,
	CodeBlockFiles,
	CodeBlockHeader,
	CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";
import PostComments from "../../../components/comments";
import type { ParsedFilter } from "./types";
import { FilterType } from "./types";

const ExampleQuery = ({ query }: { query: string }) => {
	return (
		<li className="flex items-center gap-2">
			<span>{query}</span>
			<CopyToClipboard>{query}</CopyToClipboard>
		</li>
	);
};

export default function LinearFilterDemo() {
	const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>({
		conditions: [
			{
				name: "Label" as const,
				type: FilterType.LABEL,
				operator: "not_include" as const,
				value: ["bug" as const, "feature" as const],
				selectedValue: ["bug" as const, "feature" as const],
			},
			{
				name: "Status" as const,
				type: FilterType.STATUS,
				operator: "equals" as const,
				value: ["done" as const],
				selectedValue: ["done" as const],
			},
		],
		raw_input: "label not includes bug or feature and status done",
	});

	const handleFiltersChange = useCallback((filters: ParsedFilter | null) => {
		setParsedFilters(filters);
	}, []);

	return (
		<>
			<PageBack />

			<div className="mb-8">
				<PostHeadline>How Linear&apos;s AI Filter Really Works</PostHeadline>
				<PostMetadata
					createdAt={new Date("2025-08-18")}
					updatedAt={new Date("2025-08-18")}
				/>
			</div>

			<DemoBox>
				<LinearFilter onFiltersChange={handleFiltersChange} />
			</DemoBox>

			{parsedFilters && parsedFilters.conditions.length > 0 && (
				<div className="mt-4">
					<CodeBlock
						data={[
							{
								filename: "parsed_filters",
								language: "json",
								code: JSON.stringify(parsedFilters, null, 2),
							},
						]}
						defaultValue={"json"}
					>
						<CodeBlockHeader>
							<CodeBlockFiles>
								{(item) => (
									<CodeBlockFilename key={item.language} value={item.language}>
										{item.filename}
									</CodeBlockFilename>
								)}
							</CodeBlockFiles>
						</CodeBlockHeader>
						<CodeBlockBody>
							{(item) => (
								<CodeBlockItem
									key={item.language}
									value={item.language}
									lineNumbers={false}
								>
									<CodeBlockContent language={item.language as BundledLanguage}>
										{item.code}
									</CodeBlockContent>
								</CodeBlockItem>
							)}
						</CodeBlockBody>
					</CodeBlock>
				</div>
			)}

			<div className="prose dark:prose-invert max-w-none mt-8">
				<h2>Try These Examples First</h2>

				<p>
					See how natural language gets transformed into structured filters.
					Type any of these into the demo above:
				</p>
			</div>

			<ul className="my-6 ml-6 list-disc [&>li]:mt-2 font-mono text-sm">
				<ExampleQuery query="bugs not older than 3 months" />
				<ExampleQuery query="status is in progress and label includes feature" />
				<ExampleQuery query="issues younger than 2 weeks with status todo" />
				<ExampleQuery query="label not includes bug, feature or customer-support" />
			</ul>

			<div className="prose dark:prose-invert max-w-none">
				<h2>The Magic Behind Natural Language Filtering</h2>

				<p>
					Linear&apos;s AI filter feels like magic because it bridges the gap
					between how we think and how computers understand data. Instead of
					memorizing syntax like <code>label:bug AND status:todo</code>, you
					just type &quot;show me bugs that need work.&quot;
				</p>

				<h3>The OpenAI API Implementation</h3>

				<p>
					The core parsing happens in a single API call with{" "}
					<a
						href="https://platform.openai.com/docs/guides/structured-outputs"
						target="_blank"
						rel="noopener noreferrer"
					>
						structured outputs
					</a>
				</p>
			</div>

			<CodeBlock
				data={[
					{
						filename: "actions.ts",
						language: "typescript",
						code: `export async function parseFilterAction(input: string) {
  const completion = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    response_format: zodResponseFormat(parsedFilter, "parsed_filter"),
  });

  const parsed_filter = completion.choices[0].message.parsed;
  return { success: true, data: parsed_filter };
}`,
					},
				]}
				defaultValue={"typescript"}
				className="my-4"
			>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.language} value={item.language}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem
							key={item.language}
							value={item.language}
							lineNumbers={true}
						>
							<CodeBlockContent language={item.language as BundledLanguage}>
								{item.code}
							</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>

			<div className="prose dark:prose-invert max-w-none mt-6">
				<p>The system prompt is surprisingly minimal but effective:</p>
			</div>

			<CodeBlock
				data={[
					{
						filename: "config.ts",
						language: "typescript",
						code: `export const SYSTEM_PROMPT = \`You are a filter parser for a Linear-like issue tracking system. 
Parse natural language filter descriptions into structured JSON format.

If you see multiple conditions, return an array of conditions.

Examples: 

- "bugs older than 3 months" (label: include, value: bug; date: before, value: 3, unit: months)
- "label not includes bug and status done" (label: not_include, value: bug, status: equals, value: done)

If the user asks for a filter that is not possible, return an empty array.

Today's date is \${new Date().toISOString().split("T")[0]}.
\`;`,
					},
				]}
				defaultValue={"typescript"}
				className="my-4"
			>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.language} value={item.language}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem
							key={item.language}
							value={item.language}
							lineNumbers={true}
						>
							<CodeBlockContent language={item.language as BundledLanguage}>
								{item.code}
							</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>

			<div className="prose dark:prose-invert max-w-none mt-6">
				<h3>The Zod Schema Magic</h3>

				<p>
					The secret sauce is <code>zodResponseFormat()</code> which guarantees
					the AI returns valid JSON matching our exact schema:
				</p>
			</div>

			<CodeBlock
				data={[
					{
						filename: "types.ts",
						language: "typescript",
						code: `// Define what a valid filter looks like
const labelFilter = z.object({
  name: z.literal("Label"),
  type: z.literal(FilterType.LABEL),
  operator: z.enum(["include", "not_include"]),
  value: z.array(z.enum(["bug", "feature", "customer-support"])),
  selectedValue: z.array(z.enum(["bug", "feature", "customer-support"])),
});

const statusFilter = z.object({
  name: z.literal("Status"),
  type: z.literal(FilterType.STATUS),
  operator: z.enum(["equals"]),
  value: z.array(z.enum(["todo", "in_progress", "done"])),
  selectedValue: z.array(z.enum(["todo", "in_progress", "done"])),
});

// Union of all possible filter types
const filterCondition = z.discriminatedUnion("type", [
  dateFilter,
  labelFilter, 
  statusFilter,
]);

// Final parsed output structure
export const parsedFilter = z.object({
  conditions: z.array(filterCondition),
  raw_input: z.string(),
});`,
					},
				]}
				defaultValue={"typescript"}
				className="my-4"
			>
				<CodeBlockHeader>
					<CodeBlockFiles>
						{(item) => (
							<CodeBlockFilename key={item.language} value={item.language}>
								{item.filename}
							</CodeBlockFilename>
						)}
					</CodeBlockFiles>
				</CodeBlockHeader>
				<CodeBlockBody>
					{(item) => (
						<CodeBlockItem
							key={item.language}
							value={item.language}
							lineNumbers={true}
						>
							<CodeBlockContent language={item.language as BundledLanguage}>
								{item.code}
							</CodeBlockContent>
						</CodeBlockItem>
					)}
				</CodeBlockBody>
			</CodeBlock>

			<div className="prose dark:prose-invert max-w-none mt-6">
				<h3>Why This Approach Works</h3>

				<p>
					Most implementations fail because they try to be too clever. Instead
					of building complex NLP pipelines, we leverage the LLM&apos;s existing
					language understanding and constrain the output format. The AI handles
					the ambiguity (&quot;bugs older than 3 months&quot; → date filter with
					&quot;before&quot; operator), while Zod handles the validation.
				</p>

				<p>
					The system is forgiving on input but strict on output. Users can say
					&quot;bugs from last week&quot; or &quot;show me old bug reports&quot;
					and both get parsed correctly. The structured response format means
					the frontend always knows exactly what to render.
				</p>

				<p>
					The real power emerges when users combine multiple conditions
					naturally. The AI understands context and intent, turning
					conversational queries into precise data filters.
				</p>
			</div>

			<div className="mt-12">
				<hr className="my-8" />
				<PostComments slug="linear-filter" />
			</div>
		</>
	);
}
