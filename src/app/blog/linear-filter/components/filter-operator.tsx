import type { FilterCondition } from "@/app/blog/linear-filter/types";
import { PillSegment } from "./pill-segment";
import { OPERATOR_LABELS } from "./shared";

export const FilterOperator = ({
  operator,
}: {
  operator: FilterCondition["operator"];
}) => (
  <PillSegment className="text-neutral-600 cursor-default text-xs">
    {OPERATOR_LABELS[operator]}
  </PillSegment>
);
