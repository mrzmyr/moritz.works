import { cn } from "@/lib/utils";

export const LabelBadge = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-7 text-xs border border-neutral-200 dark:border-neutral-900 rounded-full px-2.5 py-1.5 inline-flex items-center gap-2 dark:text-neutral-400 bg-white dark:bg-neutral-900/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
