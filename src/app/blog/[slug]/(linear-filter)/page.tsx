import Image from "next/image";
import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { H2, H3 } from "@/components/headlines";
import { FastCodeBlock } from "./components/fast-code-block";
import { FilterClose } from "./components/filter-close";
import { FilterDemo } from "./components/filter-demo";
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
import { StatusIndicator } from "./components/status-indicator";
import { SystemPromptCodeBlock } from "./components/system-prompt-code-block";
import { FilterType } from "./types";

export default function Page() {
  return (
    <>
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
        by: how <i>effortlessly</i> AI handle translation. Not just from 中文 to
        русский or español to Deutsch, but from{" "}
        <span className="font-semibold">
          natural language to structured data
        </span>
        .
      </p>
      <p>
        In my view, that&apos;s one of the best real-world ways to leverage AI
        in products along with code generation and RAG.
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
        Instead of memorizing syntax like <code>label:bug AND status:todo</code>{" "}
        or even needing to learn specific query languages (e.g.{" "}
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
        show me unfinished bugs from customer support
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
        Try it yourself, by typing e.g. &quot;show me unfinished bugs from
        customer support.&quot;
      </p>
      <Figure>
        <FigureContent className="p-0">
          <FilterDemo />
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
          Filters are hard, especially when they happen in conjunction. I kept
          it simple in this example, using the three filter types date, label,
          and status.
        </p>
        <Figure className="flex justify-center">
          <FigureContent>
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
                  : <code>is</code> operator
                </span>
              </div>
            </div>
          </FigureContent>
        </Figure>
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
        from performance to design and they made some interesting decisions when
        it comes to their UI.
      </p>
      <p>
        Just to name a few, to make the web app feel more like a app than a
        website.
      </p>
      <p>
        One notable one is that they don&apos;t use <code>cursor: pointer</code>{" "}
        on any elements (see also{" "}
        <a href="https://github.com/tailwindlabs/tailwindcss/pull/8962">
          Tailwind removed it in V4
        </a>{" "}
        which is even mentioning Linear explicitly). This is how you would
        expect it from your Mac OS System Settings for example.
      </p>
      <Figure>
        <FigureContent>
          <Image
            src="/static/images/blog/linear-filter-macos-system-settings.gif"
            alt="Linear Filter macOS System Settings"
            width={1854}
            height={468}
          />
        </FigureContent>
      </Figure>
      <p>
        Another one is that they don&apos;t use text selection (aka{" "}
        <code>user-select: none;</code>) except on editbale fields like the
        issue title and description.
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
            <div className="text-sm">Status Indicator</div>
            <div className="flex flex-row gap-2 px-1.5">
              <StatusIndicator status="todo" />
              <StatusIndicator status="in_progress" />
              <StatusIndicator status="done" />
              <StatusIndicator status="backlog" />
              <StatusIndicator status="in_review" />
            </div>
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
                  operator: "after",
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
              <FilterClose />
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
                operator: "after",
                selectedValue: ["2024-01-01"],
                unit: "days",
              }}
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
    operator: "after",
    selectedValue: ["2024-01-01"],
    unit: "days",
  }}
  onRemove={() => {}}
/>
              `,
          },
        ]}
        language="tsx"
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
        <FigureContent className="flex justify-center p-0">
          <FilterDemo
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
              ],
              raw_input: "status done",
            }}
          />
        </FigureContent>
        <FigureCaption>Prefilled filter with status is done</FigureCaption>
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
        </p>
        <H3>Cost per Request</H3>
        <div className="text-neutral-600 dark:text-neutral-400">
          Input: 138 × $0.00000015 = $0.0000207 (~$0.000021)
          <br />
          Output: 88 × $0.00000060 = $0.0000528 (~$0.000053)
          <br />
          <div className="pt-1">
            <strong>Total per request:</strong> $0.0000207 + $0.0000528 ={" "}
            <span className="font-semibold">~$0.000074 per filter parse</span>
          </div>
        </div>
        <p>
          Requests per $0.10:{" "}
          <span className="font-semibold">1,361 requests</span>
          <br />
          Requests per $10: <span className="font-semibold">136,054</span>
        </p>
        <p className="dark:text-neutral-400 mt-2">
          Let&apos;s say you have 2,000 users per month and they each make 5 AI
          searches per day, resulting in 300,000 requests per month.
        </p>
        <p className="dark:text-neutral-400 mt-2">
          Then you spend $0.000074 x 300,000 ={" "}
          <span className="font-semibold">$22.20 / month for 2,000 users</span>.
          Assuming that Linear has probably more than 100,000 users, you would
          spend $0.00000074 x 300,000 ={" "}
          <span className="font-semibold">
            $222.00 / month for 100,000 users
          </span>
          .
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
    </>
  );
}
