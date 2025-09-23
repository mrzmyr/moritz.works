"use client";

import { DemoBox } from "@/components/demo-box";
import { PageBack } from "@/components/page-back";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import Image from "next/image";
import { FilterOperator } from "./components/filter-operator";
import { FilterPill } from "./components/filter-pill";
import {
  FilterSchemaCodeBlock,
  FilterSchemaExampleCodeBlock,
} from "./components/filter-schema-code-block";
import { FilterTypeBadge } from "./components/filter-type-badge";
import { FilterValueSelector } from "./components/filter-value-selector";
import { DateIcon, LabelIcon, StatusIcon } from "./components/icons";
import { LlmActionCodeBlock } from "./components/llm-action-code-block";
import { RootFilterDropdown } from "./components/root-filter-dropdown";
import { SystemPromptCodeBlock } from "./components/system-prompt-code-block";
import { FilterType } from "./types";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockItem,
  CodeBlockContent,
  type BundledLanguage,
} from "@/components/ui/kibo-ui/code-block";
import { FastCodeBlock } from "./components/fast-code-block";
import { XIcon } from "lucide-react";
import { FilterClose } from "./components/filter-close";
import { toast } from "sonner";

export default function LinearFilterDemo() {
  return (
    <>
      <PageBack />

      <div className="mb-8">
        <PostHeadline>Linear AI Filter</PostHeadline>
        <PostMetadata
          createdAt={new Date("2025-08-18")}
          updatedAt={new Date("2025-08-18")}
        />
      </div>

      <div className="prose dark:prose-invert max-w-none prose-headings:mb-2 text-neutral-900 prose-li:my-0.5 prose-ul:pl-4 prose-code:bg-neutral-100/50 prose-code:border prose-code:border-neutral-200 prose-code:text-neutral-900 prose-code:rounded-md prose-code:px-1 prose-code:py-0 prose-code:font-normal prose-code:after:content-[''] prose-code:before:content-['']">
        <p>
          Linear&apos;s AI filter feels like magic because it bridges the gap
          between how we think and how computers understand data. Instead of
          memorizing syntax like <code>label:bug AND status:todo</code>, you
          just type &quot;show me bugs that need work.&quot;
        </p>

        <p>
          And the ingredients are surprisingly simple. All we need is a{" "}
          <strong>system prompt</strong>, a <strong>filter schema</strong>, and
          an <strong>LLM action</strong>.
        </p>

        <DemoBox>
          <Image
            src="/static/images/blog/linear-filter-overview.png"
            alt="Linear Filter Overview"
            width={1854}
            height={468}
          />
        </DemoBox>

        <h3>System Prompt</h3>

        <p>The system prompt is surprisingly minimal but effective:</p>

        <SystemPromptCodeBlock />

        <div className=" mt-6">
          <h3>Filter Schema</h3>
          <p>
            Filters are hard, especially when they happen in conjunction. We
            kept it simple in this example, using three filter types:
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <DateIcon /> <span>Date</span>
              <span>
                : <code>before</code> and <code>after</code> operators
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <LabelIcon /> <span>Label</span>
              <span>
                : <code>include</code> and <code>not_include</code> operators
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <StatusIcon /> <span>Status</span>
              <span>
                : <code>equals</code> operator
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FilterSchemaCodeBlock />
        </div>

        <div className=" mt-6">An example output looks like this:</div>

        <FilterSchemaExampleCodeBlock />

        <h3>Parsing via LLM</h3>

        <p>
          The core parsing happens in a single API call with{" "}
          <a
            href="https://platform.openai.com/docs/guides/structured-outputs"
            target="_blank"
            rel="noopener noreferrer"
          >
            structured outputs
          </a>
          . The magic here is <code>zodResponseFormat</code> which is a helper
          function that allows you to parse the response into a specific format.
          This will guide the LLM to example format we defined in the filter
          schema above.
        </p>

        <LlmActionCodeBlock />

        <h3>UI</h3>

        <DemoBox>
          <Image
            src="/static/images/blog/linear-filter-component.png"
            alt="Linear Filter UI"
            width={1854}
            height={468}
            className="rounded-lg"
          />
        </DemoBox>

        <p>
          Alongside ▲ Vercel, Linear is the benchmark in terms of UI in modern
          web apps, from performance to design. To an extend that founders say
          they want to build a Linear version of X.
        </p>

        <DemoBox className="mt-8 py-8 flex justify-center">
          <div className="md:scale-150 lg:scale-200">
            <FilterPill
              filter={{
                name: "Date",
                type: FilterType.DATE,
                value: "2024-01-01",
                operator: "before",
                selectedValue: ["2024-01-01"],
                unit: "days",
              }}
              onRemove={() => {}}
            />
          </div>
        </DemoBox>

        <FastCodeBlock
          data={[
            {
              filename: "filter-pill.tsx",
              language: "tsx",
              code: `
<FilterPill
  filter={{
    name: "Date",
    type: FilterType.DATE,
    value: "2024-01-01",
    operator: "before",
    selectedValue: ["2024-01-01"],
    unit: "days",
  }}
  onRemove={() => {}}
/>
              `,
            },
          ]}
          defaultValue="tsx"
          className="mt-4"
        />

        <p>
          This is also true for their filter component, it's breaking down a
          super complex problem into a simple and easy to understand interface.
        </p>

        <strong>Parts</strong>

        <DemoBox className="mt-4">
          <div className="grid grid-cols-2 gap-1">
            <div>Filter Type Badge</div>
            <div>
              <FilterTypeBadge type={FilterType.DATE} />
            </div>
            <div>Filter Value Selector</div>
            <div>
              <FilterValueSelector
                filter={{
                  name: "Date",
                  type: FilterType.DATE,
                  value: "2024-01-01",
                  operator: "before",
                  selectedValue: ["2024-01-01"],
                  unit: "days",
                }}
              />
            </div>
            <div>Filter Operator</div>
            <div>
              <div className="flex flex-row gap-1">
                <FilterOperator operator="before" />
                <FilterOperator operator="after" />
              </div>
            </div>
            <div>Filter Dropdown</div>
            <div>
              <RootFilterDropdown onSelect={() => {}} shouldShake={false} />
            </div>
            <div>Filter Pill</div>
            <div>
              <FilterPill
                filter={{
                  name: "Date",
                  type: FilterType.DATE,
                  value: "2024-01-01",
                  operator: "before",
                  selectedValue: ["2024-01-01"],
                  unit: "days",
                }}
                onRemove={() => {}}
              />
            </div>
            <div>Filter Close</div>
            <div>
              <FilterClose
                onClick={() => toast("Don't click me 3 more times!")}
              />
            </div>
          </div>
        </DemoBox>

        <div className=" mt-6">
          <h3>Why This Approach Works</h3>

          <p>
            Most implementations fail because they try to be too clever. Instead
            of building complex NLP pipelines, we leverage the LLM&apos;s
            existing language understanding and constrain the output format. The
            AI handles the ambiguity (&quot;bugs older than 3 months&quot; →
            date filter with &quot;before&quot; operator), while Zod handles the
            validation.
          </p>

          <p>
            The system is forgiving on input but strict on output. Users can say
            &quot;bugs from last week&quot; or &quot;show me old bug
            reports&quot; and both get parsed correctly. The structured response
            format means the frontend always knows exactly what to render.
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
      </div>
    </>
  );
}
