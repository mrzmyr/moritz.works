import {
  NodeResizeControl,
  ResizeControlVariant,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import { toast } from "sonner";
import { useCanvasActions } from "./canvas-actions-context";

type LinePosition = "right" | "bottom" | "top";
type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const LINE_CONTROLS: {
  position: LinePosition;
  cursor: string;
  dim: "width" | "height";
  minWidth?: number;
  minHeight?: number;
}[] = [
  { position: "right", cursor: "ew-resize", dim: "width", minWidth: 200 },
  { position: "bottom", cursor: "ns-resize", dim: "height", minHeight: 40 },
  { position: "top", cursor: "ns-resize", dim: "height", minHeight: 40 },
];

const CORNER_POSITIONS: {
  position: CornerPosition;
  cursor: string;
}[] = [
  { position: "top-left", cursor: "nwse-resize" },
  { position: "top-right", cursor: "nesw-resize" },
  { position: "bottom-left", cursor: "nesw-resize" },
  { position: "bottom-right", cursor: "nwse-resize" },
];

interface NodeResizeControlsProps {
  id: string;
  selected?: boolean;
}

export function NodeResizeControls({ id, selected }: NodeResizeControlsProps) {
  const { setNodes } = useReactFlow();
  const { updateNodeSize } = useCanvasActions();

  if (!selected) return null;

  const applySize = (params: { width?: number; height?: number }) => {
    setNodes((nds: Node[]) =>
      nds.map((n) =>
        n.id === id ? { ...n, style: { ...n.style, ...params } } : n,
      ),
    );
    updateNodeSize({ id, ...params }).catch(() =>
      toast.error("Failed to save size"),
    );
  };

  return (
    <>
      {LINE_CONTROLS.map(({ position, cursor, dim, minWidth, minHeight }) => (
        <NodeResizeControl
          key={position}
          position={position}
          variant={ResizeControlVariant.Line}
          minWidth={minWidth}
          minHeight={minHeight}
          style={{ borderColor: "transparent", borderWidth: 6, cursor }}
          onResizeEnd={(_, params) =>
            applySize(
              dim === "width"
                ? { width: params.width }
                : { height: params.height },
            )
          }
        />
      ))}

      {CORNER_POSITIONS.map(({ position, cursor }) => (
        <NodeResizeControl
          key={position}
          position={position}
          variant={ResizeControlVariant.Handle}
          minWidth={200}
          minHeight={40}
          style={{
            width: 12,
            height: 12,
            background: "transparent",
            border: "none",
            cursor,
          }}
          onResizeEnd={(_, params) =>
            applySize({ width: params.width, height: params.height })
          }
        />
      ))}
    </>
  );
}
