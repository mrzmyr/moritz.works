import { cn } from "@/lib/utils";
import {
  FilterType,
  type LabelValues,
  type ParsedFilter,
  type StatusValues,
} from "../types";
import { LabelBullet } from "./shared";
import { StatusIndicator } from "./status-indicator";

type Issue = {
  id: string;
  title: string;
  createdAt: string;
  labels: LabelValues[];
  status: StatusValues;
};

const today = new Date();
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);

export const ISSUES: Issue[] = [
  {
    id: "LI-1131",
    title: "Fix login button not responding",
    createdAt: lastWeek.toISOString(),
    labels: ["bug"],
    status: "backlog",
  },
  {
    id: "LI-1232",
    title: "Add dark mode support",
    createdAt: lastWeek.toISOString(),
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-1331",
    title: "Resolve payment processing error",
    createdAt: lastWeek.toISOString(),
    labels: ["customer-support"],
    status: "done",
  },
  {
    id: "LI-1401",
    title: "Improve dashboard loading speed",
    createdAt: lastWeek.toISOString(),
    labels: ["bug", "feature"],
    status: "in_review",
  },
  {
    id: "LI-1502",
    title: "Implement user profile editing",
    createdAt: lastWeek.toISOString(),
    labels: ["feature"],
    status: "done",
  },
  {
    id: "LI-1603",
    title: "Fix notification dropdown not closing",
    createdAt: lastWeek.toISOString(),
    labels: ["customer-support", "bug"],
    status: "in_progress",
  },
  {
    id: "LI-1704",
    title: "Add password reset functionality",
    createdAt: lastWeek.toISOString(),
    labels: ["feature", "customer-support"],
    status: "todo",
  },
  {
    id: "LI-1805",
    title: "Resolve typo in settings page",
    createdAt: today.toISOString(),
    labels: ["bug"],
    status: "done",
  },
  {
    id: "LI-1906",
    title: "Enable multi-language support",
    createdAt: today.toISOString(),
    labels: ["feature", "customer-support"],
    status: "in_progress",
  },
  {
    id: "LI-1007",
    title: "Investigate slow API response times",
    createdAt: today.toISOString(),
    labels: ["customer-support"],
    status: "backlog",
  },
  {
    id: "LI-1108",
    title: "Fix broken image links on homepage",
    createdAt: today.toISOString(),
    labels: ["bug", "feature"],
    status: "done",
  },
  {
    id: "LI-1209",
    title: "Add export to CSV feature",
    createdAt: today.toISOString(),
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-1310",
    title: "Resolve crash on mobile devices",
    createdAt: today.toISOString(),
    labels: ["customer-support", "bug"],
    status: "todo",
  },
];

const getStatusOrder = (status: StatusValues) => {
  return {
    backlog: 0,
    todo: 1,
    in_progress: 2,
    in_review: 3,
    done: 4,
  }[status];
};

const LabelBadge = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-7 text-xs border border-neutral-200 dark:border-neutral-800/50 rounded-full px-2.5 py-1.5 inline-flex items-center gap-2 dark:text-neutral-400 bg-white dark:bg-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const IssueListItem = ({ issue }: { issue: Issue }) => {
  return (
    <div
      key={issue.id}
      className="cursor-default flex flex-row gap-2 text-[13px] w-full h-[44px] hover:bg-neutral-50 dark:hover:bg-neutral-800/30 py-1 px-4"
    >
      <div className="flex flex-row gap-2 items-center">
        <span className="text-neutral-500 dark:text-neutral-400 min-w-12">
          {issue.id}
        </span>
        <StatusIndicator status={issue.status} />
      </div>
      <div className="flex items-center flex-1 truncate">
        <span className="text-ellipsis overflow-hidden whitespace-nowrap font-medium">
          {issue.title}
        </span>
      </div>
      <div className="overflow-hidden group flex-nowrap justify-end items-center hidden md:flex">
        <div className="flex flex-row gap-1 items-center">
          {issue.labels.map((label) => (
            <LabelBadge key={label}>
              <LabelBullet type={label} />
              <span className="whitespace-nowrap">{label}</span>
            </LabelBadge>
          ))}
        </div>
      </div>
      <div className="flex text-neutral-500 items-center whitespace-nowrap">
        <span>
          {new Date(issue.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
};

export const IssueList = ({
  filters,
  issues,
}: {
  filters: ParsedFilter | null;
  issues: Issue[];
}) => {
  let _issues = [
    ...issues.sort(
      (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status)
    ),
  ];

  for (const condition of filters?.conditions || []) {
    if (condition.type === FilterType.DATE) {
      _issues = _issues.filter((issue) =>
        condition.operator === "before"
          ? new Date(issue.createdAt) < new Date(condition.value)
          : new Date(issue.createdAt) > new Date(condition.value)
      );
    }
    if (condition.type === FilterType.LABEL) {
      _issues = _issues.filter((issue) =>
        condition.operator === "include"
          ? condition.value.some((label) => issue.labels.includes(label))
          : !condition.value.some((label) => issue.labels.includes(label))
      );
    }
    if (condition.type === FilterType.STATUS) {
      _issues = _issues.filter((issue) =>
        condition.value.some((status) => issue.status === status)
      );
    }
  }

  return (
    <div className="w-full flex flex-col">
      {_issues.map((issue) => (
        <IssueListItem key={issue.id} issue={issue} />
      ))}
      {_issues.length === 0 && (
        <div className="flex items-center justify-center text-neutral-500 dark:text-neutral-400 px-4 h-10 text-xs">
          <span>No issues found</span>
        </div>
      )}
    </div>
  );
};
