import { cn } from "@/lib/utils";

export const PillSegment = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-row gap-1.5 items-center px-1.5 py-0.5",
      className
    )}
  >
    {children}
  </div>
);
