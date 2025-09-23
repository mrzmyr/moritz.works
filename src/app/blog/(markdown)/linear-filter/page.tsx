"use client";

import Image from "next/image";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { H2, H3 } from "@/components/headlines";
import { PostComments } from "@/components/post-comments";
import { PostHeadline } from "@/components/post-headline";
import { PostMetadata } from "@/components/post-metadata";
import { FastCodeBlock } from "./components/fast-code-block";
import { Filter } from "./components/filter";
import { FilterClose } from "./components/filter-close";
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
import { SystemPromptCodeBlock } from "./components/system-prompt-code-block";
import { FilterType } from "./types";

export default function LinearFilterDemo() {
  return (
    <>
      <div className="mb-8">
        <PostHeadline>Linear AI Filter</PostHeadline>
        <PostMetadata
          createdAt={new Date("2025-08-18")}
          updatedAt={new Date("2025-08-18")}
        />
      </div>
      <p>
        So here we are in 2025, hype everywhere,{" "}
        <a
          href="https://www.forbes.com/sites/jasonsnyder/2025/08/26/mit-finds-95-of-genai-pilots-fail-because-companies-avoid-friction"
          target="_blank"
          rel="noopener noreferrer"
        >
          yet 95% of AI projects fail
        </a>
        .
      </p>
      <p>
        But there&apos;s one LLM capability I can&apos;t stop being fascinated
        by: how effortlessly they handle translation. Not just from{" "}
        <span className="font-semibold">&quot;中文 to русский</span> or{" "}
        <span className="font-semibold">español to Deutsch&quot;</span>, but
        from{" "}
        <span className="font-semibold">
          natural language to structured data
        </span>
        .
      </p>
      <p>
        In my view, that&apos;s one of the best real-world applications of AI in
        products today along with code generation in IDE like Cursor or
        Windsurf.
      </p>
      <p>
        One company that nails this is{" "}
        <a
          href="https://linear.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
        >
          Linear
        </a>
        , with their AI-powered filters (long before their{" "}
        <a
          href="https://linear.app/changelog/2025-08-14-product-intelligence-technology-preview"
          target="_blank"
          rel="noopener noreferrer"
        >
          Product Intelligence feature
        </a>
        ).
      </p>{" "}
      <p>
        It feels magical: instead of memorizing syntax like{" "}
        <code>label:bug AND status:todo</code> or even needing to learn specific
        query languages (e.g.{" "}
        <a
          href="https://linear.app/help/hc/en-us/articles/600021211133-JQL"
          target="_blank"
          rel="noopener noreferrer"
        >
          JQL for JIRA
        </a>
        ,{" "}
        <a
          href="https://posthog.com/blog/introducing-hogql"
          target="_blank"
          rel="noopener noreferrer"
        >
          HogQL for PostHog
        </a>
        ), you can simply type:
      </p>
      <blockquote className="font-normal">
        show me bugs from last week
      </blockquote>
      <p>
        The system bridges the gap between how we think and how computers
        understand data.
      </p>
      <p>
        And the ingredients are surprisingly simple. All we need is a{" "}
        <strong>system prompt</strong>, a <strong>filter schema</strong>, and an{" "}
        <strong>LLM parser</strong>.
      </p>
      <Figure>
        <FigureContent>
          <Image
            src="/static/images/blog/linear-filter-overview.png"
            alt="Linear Filter Overview"
            width={1854}
            height={468}
            className="rounded-lg overflow-hidden"
          />
        </FigureContent>
      </Figure>
      <H2>Demo</H2>
      <p>
        Try it yourself, by typing e.g. &quot;show me bugs that need work.&quot;
      </p>
      <Figure>
        <FigureContent>
          <Filter onChange={() => {}} />
        </FigureContent>
      </Figure>
      <H2>System Prompt</H2>
      <p>
        We will use <code>gpt-4o-mini</code> for this example. The system prompt
        is surprisingly minimal but effective. We add the current date, to
        support relative date queries (&quot;bugs since last week&quot;).
      </p>
      <SystemPromptCodeBlock />
      <div className=" mt-6">
        <H2>Filter Schema</H2>
        <p>
          Filters are hard, especially when they happen in conjunction. We kept
          it simple in this example, using three filter types:
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
      <p>I used Zod schema for validation and parsing the filter schema.</p>
      <div className="mt-4">
        <FilterSchemaCodeBlock />
      </div>
      <div className="mt-6">
        Here&apos;s an example output of the filter schema which we will use
        later on.
      </div>
      <FilterSchemaExampleCodeBlock />
      <H2>Parsing via LLM</H2>
      <p>
        Now that we have the filter schema, we need to parse the user input into
        the filter schema. The core parsing happens in a single API call with{" "}
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
      <H2>UI</H2>
      <p>
        Alongside ▲ Vercel, Linear is <i>the</i> benchmark for modern web apps,
        from performance to design. To an extend that founders say they want to
        build a Linear version of X.
      </p>
      <H3 className="mt-4">Sub Components</H3>
      <p>
        The filter component that is similar to Linear&apos;s. It is basically
        built from a <code>FilterPills</code> which includes the{" "}
        <code>FilterDropdown</code> and items from the <code>FilterPill</code>{" "}
        component.
      </p>
      <Figure className="mt-4">
        <FigureContent>
          <div className="grid grid-cols-2 gap-2.5 items-center">
            <div className="text-sm">Filter Type Badge</div>
            <div>
              <FilterTypeBadge type={FilterType.DATE} />
            </div>
            <div className="text-sm">Filter Value Selector</div>
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
            <div className="text-sm">Filter Operator</div>
            <div>
              <div className="flex flex-row gap-1">
                <FilterOperator operator="before" />
              </div>
            </div>
            <div className="text-sm">Filter Close</div>
            <div>
              <FilterClose onClick={() => {}} />
            </div>
          </div>
        </FigureContent>
      </Figure>
      <H3 className="mt-4">Filter Pill</H3>
      <Figure className="flex justify-center not-prose p-0">
        <FigureContent className="p-0">
          <Image
            src="/static/images/blog/linear-filter-components-filter-pill.png"
            alt="Linear Filter Pills"
            width={1854}
            height={468}
          />
        </FigureContent>
      </Figure>
      <p>
        The filter pill renders the sub components <code>FilterTypeBadge</code>,{" "}
        <code>FilterOperator</code>, <code>FilterValueSelector</code>, and{" "}
        <code>FilterClose</code> (naming borrowed from{" "}
        <a
          href="https://x.com/haydenbleasel"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hayden&apos;s
        </a>{" "}
        <a
          href="https://www.kibo-ui.com/components/pill"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kibo UI Pill component
        </a>
        ).
      </p>
      <Figure className="mb-4">
        <FigureContent className="flex py-8 justify-center">
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
        </FigureContent>
      </Figure>
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
      <H3 className="mt-4">Filter</H3>
      <Figure className="flex justify-center not-prose p-0">
        <FigureContent className="p-0">
          <Image
            src="/static/images/blog/linear-filter-components-filter.png"
            alt="Linear Filter Pills"
            width={1854}
            height={468}
          />
        </FigureContent>
      </Figure>
      <p>
        It all comes together in the <code>Filter</code> component where we
        iterate over the <code>FilterPill</code> components or only show the{" "}
        <code>FilterDropdown</code> if there are no filters.
      </p>
      <Figure>
        <FigureContent className="flex justify-center px-2">
          <Filter
            onChange={() => {}}
            initialFilters={{
              conditions: [
                {
                  name: "Status",
                  type: FilterType.STATUS,
                  operator: "equals",
                  value: ["done"],
                  selectedValue: [],
                },
                {
                  name: "Label",
                  type: FilterType.LABEL,
                  operator: "include",
                  value: ["bug"],
                  selectedValue: [],
                },
                {
                  name: "Date",
                  type: FilterType.DATE,
                  operator: "before",
                  value: "2024-01-01",
                  selectedValue: [],
                  unit: "days",
                },
              ],
              raw_input: "status done",
            }}
          />
        </FigureContent>
        <FigureCaption>Prefilled filter with status equals done</FigureCaption>
      </Figure>
      <Figure className="flex flex-col justify-center mt-8">
        <FigureContent>
          <Filter onChange={() => {}} />
        </FigureContent>
        <FigureCaption>Filter with no initial filters</FigureCaption>
      </Figure>
      <div className=" mt-6">
        <H2>Cost</H2>
        <p>
          Using <code>gpt-4o-mini</code> at{" "}
          <a
            href="https://openai.com/api/pricing/"
            target="_blank"
            rel="noopener noreferrer"
          >
            $0.15 per 1M input tokens
          </a>{" "}
          (<span className="font-mono">$0.00000015</span> per input token) and
          $0.60 per 1M output tokens (
          <span className="font-mono">$0.00000060</span> per output token), the{" "}
          <span className="font-semibold">
            system prompt contains 138 tokens
          </span>{" "}
          and the response JSON roughly{" "}
          <span className="font-semibold">88 tokens</span>.
          <H3>Cost per Request</H3>
          <p>
            <span className="text-neutral-600 dark:text-neutral-400">
              Input: 138 × $0.00000015 = $0.0000207 (~$0.000021)
              <br />
              Output: 88 × $0.00000060 = $0.0000528 (~$0.000053)
              <br />
              <span>
                <strong>Total per request:</strong> $0.0000207 + $0.0000528 ={" "}
                <span className="font-semibold">
                  ~$0.000074 per filter parse
                </span>
              </span>
            </span>
          </p>
          <span className="mt-2">
            Requests per $0.10:{" "}
            <span className="font-semibold">1,361 requests</span>
          </span>
          <br />
          <span className="dark:text-neutral-400 mt-2">
            Requests per $10:{" "}
            <span className="font-semibold">136,054 requests</span>
          </span>
        </p>

        <H2>Conclusion</H2>
        <p>
          This is a simple example of how to use an LLM to parse user input into
          a structured format. It is a great way to add AI capabilities to your
          products.
        </p>
        <p>
          I hope you found this example useful. If you have any questions,
          please feel free to reach out to me.
        </p>
      </div>
      <div className="mt-12">
        <hr className="my-8" />
        <PostComments slug="linear-filter" />
      </div>
    </>
  );
}
