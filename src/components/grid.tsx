import { cn } from "@/lib/utils";

export const Grid = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 my-12", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const GridItem = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col", props.className)} {...props}>
      {children}
    </div>
  );
};
