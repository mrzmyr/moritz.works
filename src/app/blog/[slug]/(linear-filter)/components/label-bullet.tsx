import { cn } from "@/lib/utils";
import type { LabelValues } from "../types";

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
