import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function Draggable({
  children,
  id,
  x,
  y,
}: {
  children: React.ReactNode;
  id: string;
  x: number;
  y: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    position: "absolute" as const,
    left: x,
    top: y,
    transform: CSS.Translate.toString(transform),
    // cursor: "grab",
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div
        className={`transition-transform duration-300 ease-in-out ${isDragging ? "scale-110" : "scale-100"}`}
      >
        {children}
      </div>
    </div>
  );
}
