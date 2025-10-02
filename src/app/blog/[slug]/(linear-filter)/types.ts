import type { LabelValues, StatusValues } from "./schema";

export type Issue = {
  id: string;
  title: string;
  createdAt: string;
  labels: LabelValues[];
  status: StatusValues;
};

export enum FilterType {
  DATE = "date",
  LABEL = "label",
  STATUS = "status",
}

export type FilterValueDropdownItem = {
  value: string;
  title: string;
  icon: React.ReactNode;
};
