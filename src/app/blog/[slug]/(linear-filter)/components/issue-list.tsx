import { cn } from "@/lib/utils";
import {
  FilterType,
  type LabelValues,
  type ParsedFilter,
  type StatusValues,
} from "../types";
import { LabelBullet } from "./shared";

type Issue = {
  id: string;
  title: string;
  createdAt: string;
  labels: LabelValues[];
  status: StatusValues;
};

export const ISSUES: Issue[] = [
  {
    id: "LI-131",
    title: "Issue 1",
    createdAt: "2021-01-01",
    labels: ["bug"],
    status: "todo",
  },
  {
    id: "LI-232",
    title: "Issue 2",
    createdAt: "2021-01-02",
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-331",
    title: "Issue 3",
    createdAt: "2021-01-03",
    labels: ["customer-support"],
    status: "done",
  },
  {
    id: "LI-401",
    title: "Issue 4",
    createdAt: "2021-01-04",
    labels: ["bug", "feature"],
    status: "todo",
  },
  {
    id: "LI-502",
    title: "Issue 5",
    createdAt: "2021-01-05",
    labels: ["feature"],
    status: "done",
  },
  {
    id: "LI-603",
    title: "Issue 6",
    createdAt: "2021-01-06",
    labels: ["customer-support", "bug"],
    status: "in_progress",
  },
  {
    id: "LI-704",
    title: "Issue 7",
    createdAt: "2021-01-07",
    labels: ["feature", "customer-support"],
    status: "todo",
  },
  {
    id: "LI-805",
    title: "Issue 8",
    createdAt: "2021-01-08",
    labels: ["bug"],
    status: "done",
  },
  {
    id: "LI-906",
    title: "Issue 9",
    createdAt: "2021-01-09",
    labels: ["feature", "customer-support"],
    status: "in_progress",
  },
  {
    id: "LI-1007",
    title: "Issue 10",
    createdAt: "2021-01-10",
    labels: ["customer-support"],
    status: "todo",
  },
  {
    id: "LI-1108",
    title: "Issue 11",
    createdAt: "2021-01-11",
    labels: ["bug", "feature"],
    status: "done",
  },
  {
    id: "LI-1209",
    title: "Issue 12",
    createdAt: "2021-01-12",
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-1310",
    title: "Issue 13",
    createdAt: "2021-01-13",
    labels: ["customer-support", "bug"],
    status: "todo",
  },
];

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
        "h-5 text-xs border border-neutral-200 dark:border-neutral-700/50 rounded-full px-2.5 py-0.5 inline-flex items-center gap-2 dark:text-neutral-400 bg-white dark:bg-neutral-800",
        className
      )}
      {...props}
    >
      {children}
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
  let _issues = [...issues];

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
    <div className="w-full flex flex-col gap-1">
      {_issues.map((issue) => (
        <div key={issue.id} className="flex flex-row gap-2 text-xs w-full">
          <div className="text-neutral-400 dark:text-neutral-400 w-2/12">
            {issue.id}
          </div>
          <div className="w-2/12">{issue.status}</div>
          <div className="w-3/12">{issue.title}</div>
          <div className="overflow-hidden group flex flex-nowrap justify-end w-7/12">
            {issue.labels.map((label) => (
              <LabelBadge key={label}>
                <LabelBullet type={label} />
                <span className="whitespace-nowrap">{label}</span>
              </LabelBadge>
            ))}
          </div>
          <div className="w-2/12">{issue.createdAt}</div>
        </div>
      ))}
    </div>
  );
};
