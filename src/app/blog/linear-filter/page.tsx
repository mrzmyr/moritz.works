"use client";

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
import { useCallback, useState } from "react";
import type { ParsedFilter } from "./actions";

export default function LinearFilterDemo() {
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

	const handleFiltersChange = useCallback((filters: ParsedFilter | null) => {
		setParsedFilters(filters);
	}, []);

	return (
		<>
			<PageBack />

			<div className="mb-8">
				<PostHeadline>How to build the Linear AI filter component</PostHeadline>
				<PostMetadata
					createdAt={new Date("2025-08-18")}
					updatedAt={new Date("2025-08-18")}
				/>
			</div>

			{/* 
      <DemoBox className="mb-8 p-0">
        <video
          src="/static/videos/linear-filter-2.mp4"
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        />
      </DemoBox> */}

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

			<p className="leading-7 [&:not(:first-child)]:mt-6">
				You can try the following queries:
			</p>

			<ul className="my-6 ml-6 list-disc [&>li]:mt-2 font-mono">
				<li>
					<button
						type="button"
						onClick={() => setQuery("bugs not older than 3 months")}
						className="hover:text-blue-500 cursor-pointer bg-transparent border-none p-0 font-mono text-left"
					>
						bugs not older than 3 months
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() =>
							setQuery("status is in progress and label includes feature")
						}
						className="hover:text-blue-500 cursor-pointer bg-transparent border-none p-0 font-mono text-left"
					>
						status is in progress and label includes feature
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() =>
							setQuery("issues younger than 2 weeks with status todo")
						}
						className="hover:text-blue-500 cursor-pointer bg-transparent border-none p-0 font-mono text-left"
					>
						issues younger than 2 weeks with status todo
					</button>
				</li>
				<li>
					<button
						type="button"
						onClick={() => setQuery("label not includes bug and status done")}
						className="hover:text-blue-500 cursor-pointer bg-transparent border-none p-0 font-mono text-left"
					>
						label not includes bug and status done
					</button>
				</li>
			</ul>

			<p className="leading-7 [&:not(:first-child)]:mt-6">
				You can also try to combine multiple filters.
			</p>
		</>
	);
}
