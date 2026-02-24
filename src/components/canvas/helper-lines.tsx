"use client";

import { useViewport, type Node } from "@xyflow/react";
import { forwardRef, useImperativeHandle, useState } from "react";

const SNAP_THRESHOLD = 5;

export type HelperLinesState = {
  horizontal?: number;
  vertical?: number;
};

export type HelperLinesHandle = {
  update: (state: HelperLinesState) => void;
};

export function getHelperLines(
  draggedNode: Node,
  nodes: Node[],
  threshold = SNAP_THRESHOLD,
): HelperLinesState {
  const nodeW =
    draggedNode.measured?.width ??
    (draggedNode.style?.width as number | undefined) ??
    288;
  const nodeH =
    draggedNode.measured?.height ??
    (draggedNode.style?.height as number | undefined) ??
    100;

  const nodeEdgesX = [
    draggedNode.position.x,
    draggedNode.position.x + nodeW / 2,
    draggedNode.position.x + nodeW,
  ];
  const nodeEdgesY = [
    draggedNode.position.y,
    draggedNode.position.y + nodeH / 2,
    draggedNode.position.y + nodeH,
  ];

  const result: HelperLinesState = {};
  let closestH = threshold;
  let closestV = threshold;

  for (const n of nodes) {
    if (n.id === draggedNode.id || n.hidden) continue;

    const nW =
      n.measured?.width ?? (n.style?.width as number | undefined) ?? 288;
    const nH =
      n.measured?.height ?? (n.style?.height as number | undefined) ?? 100;

    const nEdgesX = [n.position.x, n.position.x + nW / 2, n.position.x + nW];
    const nEdgesY = [n.position.y, n.position.y + nH / 2, n.position.y + nH];

    for (const a of nodeEdgesX) {
      for (const b of nEdgesX) {
        const dist = Math.abs(a - b);
        if (dist < closestV) {
          closestV = dist;
          result.vertical = b;
        }
      }
    }

    for (const a of nodeEdgesY) {
      for (const b of nEdgesY) {
        const dist = Math.abs(a - b);
        if (dist < closestH) {
          closestH = dist;
          result.horizontal = b;
        }
      }
    }
  }

  return result;
}

export const HelperLines = forwardRef<
  HelperLinesHandle,
  { isDark: boolean }
>(function HelperLines({ isDark }, ref) {
  const [state, setState] = useState<HelperLinesState>({});
  useImperativeHandle(ref, () => ({ update: setState }));

  const { horizontal, vertical } = state;
  const { x, y, zoom } = useViewport();

  if (horizontal === undefined && vertical === undefined) return null;

  const color = isDark ? "rgba(96,165,250,0.8)" : "rgba(59,130,246,0.8)";

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5, width: "100%", height: "100%", overflow: "visible" }}
    >
      {horizontal !== undefined && (
        <line
          x1={0}
          y1={horizontal * zoom + y}
          x2="100%"
          y2={horizontal * zoom + y}
          stroke={color}
          strokeWidth={1}
        />
      )}
      {vertical !== undefined && (
        <line
          x1={vertical * zoom + x}
          y1={0}
          x2={vertical * zoom + x}
          y2="100%"
          stroke={color}
          strokeWidth={1}
        />
      )}
    </svg>
  );
});
