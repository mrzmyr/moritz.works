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
    <div
      className={cn(
        "bg-white dark:bg-primary-foreground rounded-lg p-4 border border-border w-full overflow-hidden block  overflow-x-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};
