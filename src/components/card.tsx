import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900/50 rounded-lg px-6 pb-6 pt-5 border border-border",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("leading-relaxed mt-4", className)}>{children}</div>
  );
};

export const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "font-medium text-neutral-900 dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </div>
  );
};
