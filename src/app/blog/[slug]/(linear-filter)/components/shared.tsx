import { CalendarIcon } from "lucide-react";
import type React from "react";
import type { FilterCondition } from "../schema";
import { FilterType, type FilterValueDropdownItem } from "../types";
import { AssigneeIcon, DateIcon, LabelIcon, StatusIcon } from "./icons";
import { LabelBullet } from "./label-bullet";
import { StatusIndicator } from "./status-indicator";

export const ITEMS_BY_TYPE: Record<FilterType, FilterValueDropdownItem[]> = {
  date: [
    { value: "1 month ago", title: "1 month ago", icon: <CalendarIcon /> },
    { value: "3 months ago", title: "3 months ago", icon: <CalendarIcon /> },
    { value: "6 months ago", title: "6 months ago", icon: <CalendarIcon /> },
  ],
  label: [
    {
      value: "bug",
      title: "bug",
      icon: <LabelBullet type="bug" />,
    },
    {
      value: "feature",
      title: "feature",
      icon: <LabelBullet type="feature" />,
    },
    {
      value: "customer-support",
      title: "customer-support",
      icon: <LabelBullet type="customer-support" />,
    },
  ],
  status: [
    { value: "todo", title: "Todo", icon: <StatusIndicator status="todo" /> },
    {
      value: "in_review",
      title: "In Review",
      icon: <StatusIndicator status="in_review" />,
    },
    {
      value: "in_progress",
      title: "In Progress",
      icon: <StatusIndicator status="in_progress" />,
    },
    {
      value: "backlog",
      title: "Backlog",
      icon: <StatusIndicator status="backlog" />,
    },
    { value: "done", title: "Done", icon: <StatusIndicator status="done" /> },
  ],
};

export const DISPLAY_MAP: Record<
  FilterType,
  { icon: React.ReactNode; label: string }
> = {
  [FilterType.DATE]: { icon: <DateIcon />, label: "Created Date" },
  [FilterType.LABEL]: { icon: <LabelIcon />, label: "Label" },
  [FilterType.STATUS]: { icon: <StatusIcon />, label: "Status" },
};

export const OPERATOR_LABELS: Record<FilterCondition["operator"], string> = {
  before: "before",
  after: "after",
  include: "include",
  not_include: "not include",
  equals: "is",
};

export const TERMS = [
  { value: "Status", icon: <StatusIcon /> },
  { value: "Assignee", icon: <AssigneeIcon /> },
  { value: "Created", icon: <DateIcon /> },
  { value: "Label", icon: <LabelIcon /> },
];
