import { CalendarIcon } from "lucide-react";
import type React from "react";
import type {
  FilterCondition,
  LabelValues,
} from "@/app/blog/(markdown)/linear-filter/types";
import { FilterType } from "@/app/blog/(markdown)/linear-filter/types";
import { cn } from "@/lib/utils";
import {
  AssigneeIcon,
  DateIcon,
  DoneIcon,
  InProgressIcon,
  LabelIcon,
  StatusIcon,
  TodoIcon,
} from "./icons";

export const LabelBullet = ({ type }: { type: LabelValues }) => {
  const typeToColor: Record<LabelValues, string> = {
    bug: "bg-[#eb5757]",
    feature: "bg-[#5e6ad2]",
    "customer-support": "bg-[#26b5ce]",
  };

  return (
    <span
      className={cn("inline-block w-2.5 h-2.5 rounded-full", typeToColor[type])}
    />
  );
};

export type FilterValueDropdownItem = {
  value: string;
  title: string;
  icon: React.ReactNode;
};

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
    { value: "todo", title: "Todo", icon: <TodoIcon /> },
    { value: "in progress", title: "In Progress", icon: <InProgressIcon /> },
    { value: "done", title: "Done", icon: <DoneIcon /> },
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
  equals: "equals",
};

export const TERMS = [
  { value: "Status", icon: <StatusIcon /> },
  { value: "Assignee", icon: <AssigneeIcon /> },
  { value: "Created", icon: <DateIcon /> },
  { value: "Label", icon: <LabelIcon /> },
];
