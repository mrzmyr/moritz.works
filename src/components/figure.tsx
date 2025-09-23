import { cn } from "@/lib/utils";

export const Figure = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <figure className={cn("not-prose", className)}>{children}</figure>;
};

export const FigureCaption = ({ children }: { children: React.ReactNode }) => {
  return (
    <figcaption className="text-xs text-neutral-500 mt-2 text-center">
      {children}
    </figcaption>
  );
};

export const FigureContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg p-6 py-4 border border-neutral-200 dark:border-neutral-700 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};
