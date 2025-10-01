import type { Issue } from "../types";
import { LabelBadge } from "./label-badge";
import { LabelBullet } from "./label-bullet";
import { StatusIndicator } from "./status-indicator";

export const IssueListItem = ({ issue }: { issue: Issue }) => {
  return (
    <div
      key={issue.id}
      className="cursor-default flex flex-row gap-2 text-[13px] w-full h-[44px] hover:bg-neutral-50 dark:hover:bg-neutral-800/30 py-1 px-4 dark:text-white text-neutral-800"
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
