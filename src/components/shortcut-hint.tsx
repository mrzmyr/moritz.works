import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export const ShortcutHint = ({
  keys,
  className,
}: {
  keys: string | string[];
  className?: string;
}) => {
  const keyList = Array.isArray(keys) ? keys : [keys];

  return (
    <KbdGroup className={cn("align-middle", className)}>
      {keyList.map((key) => (
        <Kbd key={key} className="h-4 min-w-4 px-1 text-[10px]">
          {key.toUpperCase()}
        </Kbd>
      ))}
    </KbdGroup>
  );
};
