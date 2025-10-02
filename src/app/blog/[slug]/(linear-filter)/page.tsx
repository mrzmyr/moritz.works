import { InfoIcon } from "lucide-react";
import Image from "next/image";
import { SiGithub } from "react-icons/si";
import { Figure, FigureContent } from "@/components/figure";
import { H2, H3 } from "@/components/headlines";
import { SimpleCodeBlock } from "@/components/simple-code-block";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GITHUB_REPO } from "@/config/app";
import {
  FilterSchemaCodeBlock,
  FilterSchemaExampleCodeBlock,
} from "./code-blocks/filter-schema-code-block";
import { LlmActionCodeBlock } from "./code-blocks/llm-action-code-block";
import { SystemPromptCodeBlock } from "./code-blocks/system-prompt-code-block";
import { FigureStatusIndicatorEditor } from "./components/figure-status-indicator-editor";
import { FilterClose } from "./components/filter-close";
import { FilterDemo } from "./components/filter-demo";
import { FilterDropdown } from "./components/filter-dropdown";
import { FilterOperatorBagde } from "./components/filter-operator-badge";
import { FilterPill } from "./components/filter-pill";
import { FilterTypeBadge } from "./components/filter-type-badge";
import { FilterValueBadge } from "./components/filter-value-badge";
import { DateIcon, LabelIcon, StatusIcon } from "./components/icons";
import { StatusIndicator } from "./components/status-indicator";
import { FilterType } from "./types";

const GithubLink = ({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={`https://github.com/${GITHUB_REPO}/blob/main/${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block align-baseline"
    >
      <SiGithub className="text-neutral-500 dark:text-neutral-400 w-3.5 h-3.5 inline align-text-bottom mr-1" />
      <span>{children}</span>
    </a>
  );
};

const InfoTooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="w-3.5 h-3.5 hover:text-neutral-600 dark:hover:text-neutral-400 inline-block" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs leading-relaxed">
          <p>{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
        And the ingredients are surprisingly simple. All we need is a{" "}
        <strong>system prompt</strong>, a <strong>filter schema</strong>, and an{" "}
        <strong>LLM parser</strong>.
      </p>
      <Figure>
        <FigureContent className="p-0">
          <Image
            src="/static/images/blog/linear-filter-overview.png"
            alt="Linear Filter Overview"
            width={1854}
            height={468}
            className="rounded-lg overflow-hidden dark:invert"
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
      <FilterSchemaCodeBlock />
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
        One notable one is that they don&apos;t use <code>cursor: pointer</code>{" "}
        on any elements (see also{" "}
        <a href="https://github.com/tailwindlabs/tailwindcss/pull/8962">
          Tailwind removed it in V4
        </a>{" "}
        which is even mentioning Linear explicitly).
      </p>
      <p>
        Little details make a difference, for example how they do the inital
        loading animation. One skeleton builds after another to indicate that
        its <i>building up</i> and not just loading all at once, easily
        achievable by using the <code>delay</code> and <code>duration</code> on
        the <code>Skeleton</code> component.
      </p>
      <Figure>
        <FigureContent>
          <div className="flex flex-row gap-2">
            <Skeleton className="w-[180px] h-7 bg-neutral-200 dark:bg-neutral-700 animate-pulse delay-0 duration-[2s]" />
            <Skeleton className="w-[100px] h-7 bg-neutral-200 dark:bg-neutral-700 animate-pulse delay-500 duration-[2s]" />
            <Skeleton className="w-[140px] h-7 bg-neutral-200 dark:bg-neutral-700 animate-pulse delay-1000 duration-[2s]" />
          </div>
        </FigureContent>
      </Figure>
      <SimpleCodeBlock lang="tsx">
        {`<Skeleton className="w-[180px] h-7 animate-pulse delay-0 duration-[2s]" />
<Skeleton className="w-[100px] h-7 animate-pulse delay-500 duration-[2s]" />
<Skeleton className="w-[140px] h-7 animate-pulse delay-1000 duration-[2s]" />`}
      </SimpleCodeBlock>
      <p>
        More of a subtle detail is that they don&apos;t use any text selection
        (aka <code>user-select: none;</code>) except on editable fields like the
        issue title and description. High chances this is to make the app feel
        more native.
      </p>
      <p>
        An element, technically not needed to create the filter UI, but still
        nice to have, was the status indicator for the issue list items.
      </p>
      <Figure>
        <FigureContent className="py-8">
          <div className="flex flex-row gap-2 px-1.5 justify-center md:scale-[200%] lg:scale-[200%]">
            <StatusIndicator status="todo" />
            <StatusIndicator status="in_progress" />
            <StatusIndicator status="done" />
            <StatusIndicator status="backlog" />
            <StatusIndicator status="in_review" />
          </div>
        </FigureContent>
      </Figure>
      <p>
        Here I use a simple SVG to a a cirlce for the outline and a path for the
        fill.
      </p>
      <SimpleCodeBlock lang="tsx">
        {`<svg
  viewBox={\`0 0 14 14\`}
  width={14}
  height={14}
>
  <circle
    cx={14 / 2}
    cy={14 / 2}
    r={6}
    fill="transparent"
    stroke={"yellow"}
    strokeWidth={2}
  />
  <path d={d} fill={"yellow"} />
</svg>`}
      </SimpleCodeBlock>
      <p>
        The <code>d</code> is then generated by the <code>arc</code> function.
        We render a <code>DoneCircle</code> component if the status is{" "}
        <code>done</code>. And for the <code>backlog</code> status, we use a{" "}
        <code>strokeDasharray</code> to create a dashed line on the circle.
      </p>
      <FigureStatusIndicatorEditor />
      <p>
        Check the code here{" "}
        <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/status-indicator.tsx">
          Status Indicator
        </GithubLink>
        .
      </p>
      <H3 className="mt-4">Sub Components</H3>
      <p>
        The <code>Filter</code> component includes the sub components{" "}
        <code>FilterDropdown</code> and <code>FilterPill</code> and the{" "}
        <code>IssueList</code> component.
      </p>
      <H3 className="mt-4">Filter Dropdown</H3>
      <p>
        The <code>FilterDropdown</code> component uses shadcn's{" "}
        <a
          href="https://ui.shadcn.com/docs/components/popover"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>Popover</code>
        </a>{" "}
        component in conjunction with a{" "}
        <a
          href="https://ui.shadcn.com/docs/components/command"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>CommandList</code>
        </a>{" "}
        component to render the list of items. I only renders one item along a
        few placeholders to call the AI filter function.
      </p>
      <Figure>
        <FigureContent>
          <FilterDropdown />
        </FigureContent>
      </Figure>
      <H3 className="mt-4">Filter Pill</H3>
      <p>
        The <code>FilterPill</code> renders the sub components{" "}
        <code>FilterTypeBadge</code>, <code>FilterOperatorBagde</code>,{" "}
        <code>FilterValueBadge</code>, and <code>FilterClose</code>.
      </p>
      <Figure>
        <FigureContent className="p-0">
          <Image
            src="/static/images/blog/linear-filter-components-filter-pill.png"
            alt="Linear Filter Pills"
            width={1854}
            height={468}
            className="dark:invert"
          />
        </FigureContent>
      </Figure>
      <Figure className="mt-4">
        <FigureContent>
          <div className="grid grid-cols-2 gap-2.5 items-center text-sm">
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-type-badge.tsx">
                Filter Type Badge
              </GithubLink>
            </div>
            <div>
              <FilterTypeBadge type={FilterType.DATE} />
            </div>
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-value-selector.tsx">
                Filter Value Selector
              </GithubLink>
            </div>
            <div>
              <FilterValueBadge
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
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-operator.tsx">
                Filter Operator
              </GithubLink>
            </div>
            <div>
              <div className="flex flex-row gap-1">
                <FilterOperatorBagde operator="before" />
              </div>
            </div>
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-close.tsx">
                Filter Close
              </GithubLink>
            </div>
            <div>
              <FilterClose />
            </div>
          </div>
        </FigureContent>
      </Figure>
      <H3 className="mt-4">Filter</H3>
      <Figure className="p-0">
        <FigureContent className="p-0">
          <Image
            src="/static/images/blog/linear-filter-components-filter.png"
            alt="Linear Filter Pills"
            width={1854}
            height={468}
            className="dark:invert"
          />
        </FigureContent>
      </Figure>
      <p>
        It all comes together in the <code>Filter</code> component where we
        iterate over the <code>FilterPill</code> components or only show the{" "}
        <code>FilterDropdown</code> if there are no filters.
      </p>
      <Figure className="mt-4">
        <FigureContent>
          <div className="grid grid-cols-2 gap-2.5 items-start text-sm">
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-pill.tsx">
                Filter Pill - Date
              </GithubLink>
            </div>
            <div className="flex flex-col gap-2 px-1.5">
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
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-pill.tsx">
                Filter Pill - Label
              </GithubLink>
            </div>
            <div className="flex flex-col gap-2 px-1.5">
              <FilterPill
                filter={{
                  name: "Label",
                  type: FilterType.LABEL,
                  value: ["bug"],
                  operator: "include",
                  selectedValue: ["bug"],
                }}
              />
            </div>
            <div className="text-sm">
              <GithubLink path="src/app/blog/%5Bslug%5D/(linear-filter)/components/filter-pill.tsx">
                Filter Pill - Status
              </GithubLink>
            </div>
            <div className="flex flex-col gap-2 px-1.5">
              <FilterPill
                filter={{
                  name: "Status",
                  type: FilterType.STATUS,
                  value: ["done"],
                  operator: "equals",
                  selectedValue: ["done"],
                }}
              />
            </div>
          </div>
        </FigureContent>
      </Figure>
      <SimpleCodeBlock lang="tsx">
        {`
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
        `}
      </SimpleCodeBlock>
      <div className=" mt-6">
        <H2>Cost</H2>
        <p>
          Using <code>gpt-4o-mini</code> at{" "}
          <a
            href="https://openai.com/api/pricing/"
            target="_blank"
            rel="noopener noreferrer"
          >
            $0.15 per 1M input tokens and $0.60 per 1M output tokens
          </a>
          , the{" "}
          <span className="font-semibold">
            system prompt contains 138 tokens
          </span>{" "}
          and the response JSON roughly{" "}
          <span className="font-semibold">88 tokens</span>.
        </p>
        <p>
          Resulting in request cost of{" "}
          <span className="font-semibold">$0.000074</span>{" "}
          <InfoTooltip>
            input * token price + output * token price <br /> $0.000015 * 138 +
            $0.000060 * 88 = $0.000074
          </InfoTooltip>
          . Assuming 5 requests per user per month for 100,000 users this is
          around $1,110.00 per month{" "}
          <InfoTooltip>
            30 days x 5 requests x 100,000 users = 15,000,000 requests per month{" "}
            <br /> $0.000074 * 15,000,000 = $1,110.00
          </InfoTooltip>
          .
        </p>
        <p>
          Given the potential benefits this has for users, thats a pretty good
          price point. And I'm pretty sure you can get the cost down even
          further by using a cheaper model or tuning your own.
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
