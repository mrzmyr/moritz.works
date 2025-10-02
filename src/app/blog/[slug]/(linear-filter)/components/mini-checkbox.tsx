import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const MiniCheckbox = ({ checked }: { checked: boolean }) => (
  <div
    className={cn(
      "w-3.5 h-3.5 rounded-[3px] flex items-center justify-center",
      checked && "bg-[#5e6ad2] group-hover:bg-[#5e6ad2]",
      !checked &&
        "dark:bg-popover dark:group-hover:bg-border group-hover:outline-1 group-hover:outline-border",
    )}
  >
    {checked && <Check className="w-3.5 h-3.5 text-white" />}
  </div>
);
