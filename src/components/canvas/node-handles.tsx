import { cn } from "@/lib/utils";
import { Handle, Position } from "@xyflow/react";

const HANDLES = [
  {
    id: "top",
    position: Position.Top,
    transform: "translate(-50%, -100%)",
    shape: "!w-5 !h-2 !rounded-t-full !rounded-b-none !border-b-0",
  },
  {
    id: "left",
    position: Position.Left,
    transform: "translate(-100%, -50%)",
    shape: "!w-2 !h-5 !rounded-l-full !rounded-r-none !border-r-0",
  },
  {
    id: "right",
    position: Position.Right,
    transform: "translate(100%, -50%)",
    shape: "!w-2 !h-5 !rounded-r-full !rounded-l-none !border-l-0",
  },
  {
    id: "bottom",
    position: Position.Bottom,
    transform: "translate(-50%, 100%)",
    shape: "!w-5 !h-2 !rounded-b-full !rounded-t-none !border-t-0",
  },
] as const;

export function NodeHandles({ draggable }: { draggable?: boolean }) {
  return (
    <>
      {HANDLES.map(({ id, position, transform, shape }) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          isConnectable
          style={{ transform }}
          className={cn(
            "!bg-neutral-300 dark:!bg-neutral-600 !border-neutral-300 dark:!border-neutral-500",
            shape,
            draggable
              ? "opacity-0 group-hover:opacity-100 transition-opacity"
              : "!opacity-0 !pointer-events-none",
          )}
        />
      ))}
    </>
  );
}
