import type { FilterCondition } from "../schema";
import { OPERATOR_LABELS } from "./shared";

export const FilterOperatorBagde = ({
  operator,
}: {
  operator: FilterCondition["operator"];
}) => (
  <div className="flex flex-row gap-1.5 items-center px-1.5 py-0.5 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-default text-xs">
    {OPERATOR_LABELS[operator]}
  </div>
);
