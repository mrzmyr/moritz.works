import type { FilterCondition } from "../schema";
import { DISPLAY_MAP } from "./shared";

export const FilterTypeBadge = ({
  type,
}: {
  type: FilterCondition["type"];
}) => {
  const { icon, label } = DISPLAY_MAP[type];
  return (
    <div className="flex flex-row gap-1.5 items-center px-1.5 py-0.5 bg-white dark:bg-neutral-800 text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
};
