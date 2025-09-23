import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const MiniCheckbox = ({ checked }: { checked: boolean }) => (
  <div
    className={cn(
      "w-3.5 h-3.5 rounded-[3px] group-hover:bg-white flex items-center justify-center",
      checked
        ? "bg-[#5e6ad2] group-hover:bg-[#5e6ad2]"
        : "bg-white text-gray-200 group-hover:bg-white group-hover:outline-1 group-hover:outline-neutral-400"
    )}
  >
    {checked && <Check className="w-3.5 h-3.5 text-white" />}
  </div>
);
