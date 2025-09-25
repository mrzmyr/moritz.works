import type { FilterCondition } from "../types";
import { PillSegment } from "./pill-segment";
import { DISPLAY_MAP } from "./shared";

export const FilterTypeBadge = ({
  type,
}: {
  type: FilterCondition["type"];
}) => {
  const { icon, label } = DISPLAY_MAP[type];
  return (
    <PillSegment className="text-xs">
      {icon}
      <span>{label}</span>
    </PillSegment>
  );
};
