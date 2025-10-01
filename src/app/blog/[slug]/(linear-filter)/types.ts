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

export const FILTER_PLURAL_NAMES = {
  [FilterType.DATE]: "dates",
  [FilterType.LABEL]: "labels",
  [FilterType.STATUS]: "statuses",
};
