import type { ParsedFilter, StatusValues } from "../schema";
import { FilterType, type Issue } from "../types";
import { IssueListItem } from "./issue-list-item";

const getStatusOrder = (status: StatusValues) => {
  return {
    backlog: 0,
    todo: 1,
    in_progress: 2,
    in_review: 3,
    done: 4,
  }[status];
};

const getFilteredIssues = ({
  issues,
  filters,
}: {
  issues: Issue[];
  filters: ParsedFilter | null;
}) => {
  let _issues = [...issues];

  for (const condition of filters?.conditions || []) {
    if (condition.type === FilterType.DATE) {
      _issues = _issues.filter((issue) =>
        condition.operator === "before"
          ? new Date(issue.createdAt) < new Date(condition.value)
          : new Date(issue.createdAt) > new Date(condition.value),
      );
    }
    if (condition.type === FilterType.LABEL) {
      _issues = _issues.filter((issue) =>
        condition.operator === "include"
          ? condition.value.some((label) => issue.labels.includes(label))
          : !condition.value.some((label) => issue.labels.includes(label)),
      );
    }
    if (condition.type === FilterType.STATUS) {
      _issues = _issues.filter((issue) =>
        condition.value.some((status) => issue.status === status),
      );
    }
  }

  return _issues;
};

const getSortedIssues = ({ issues }: { issues: Issue[] }) => {
  return issues.sort(
    (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status),
  );
};

const EmptyState = () => {
  return (
    <div className="flex items-center justify-center text-neutral-500 dark:text-neutral-400 px-4 h-10 text-xs">
      <span>No issues found</span>
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
  const sortedIssues = getSortedIssues({ issues });
  const _issues = getFilteredIssues({ issues: sortedIssues, filters });

  return (
    <div className="w-full flex flex-col select-none">
      {_issues.map((issue) => (
        <IssueListItem key={issue.id} issue={issue} />
      ))}
      {_issues.length === 0 && <EmptyState />}
    </div>
  );
};
