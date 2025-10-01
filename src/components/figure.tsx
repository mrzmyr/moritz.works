import { cn } from "@/lib/utils";

export const Figure = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <figure className={cn(className)}>{children}</figure>;
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
    <span
      className={cn(
        "bg-white dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-900 w-full overflow-hidden block",
        className,
      )}
    >
      {children}
    </span>
  );
};
