"use client";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { ChevronDown, ChevronRight, GripVertical, Share2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/config/app";
import { useCanvasActions } from "./canvas-actions-context";
import { useHistoryContext } from "./history-context";
import { DynamicLucideIcon, IconPicker } from "./icon-picker";
import { ImageDropzone } from "./image-dropzone";
import { MarkdownEditor } from "./markdown-editor";
import type { AgentNodeData, AgentNodeType } from "./types";

function agentNodePropsAreEqual(
  prev: NodeProps<AgentNodeType>,
  next: NodeProps<AgentNodeType>,
): boolean {
  return (
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.draggable === next.draggable &&
    prev.data.title === next.data.title &&
    prev.data.icon === next.data.icon &&
    prev.data.description === next.data.description &&
    prev.data.imageUrl === next.data.imageUrl &&
    prev.data.cardType === next.data.cardType &&
    prev.data.hasChildren === next.data.hasChildren &&
    prev.data.collapsed === next.data.collapsed &&
    prev.data.openIconPicker === next.data.openIconPicker &&
    prev.data.autoFocusTitle === next.data.autoFocusTitle &&
    prev.data.autoFocusDescription === next.data.autoFocusDescription &&
    prev.data.isLinked === next.data.isLinked
  );
}

export const AgentNode = memo(function AgentNode({
  id,
  data,
  selected,
  draggable,
}: NodeProps<AgentNodeType>) {
  const { updateNodeData, setNodes } = useReactFlow();
  const { pushHistory, focusPendingRef, toggleCollapse } = useHistoryContext();
  const { updateNode, updateNodeSize } = useCanvasActions();
  const titleRef = useRef<HTMLSpanElement>(null);
  const saveDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [descriptionForceEdit, setDescriptionForceEdit] = useState(false);
  const [isDraggingOverCard, setIsDraggingOverCard] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const dragCounterCard = useRef(0);

  const handleShare = (platform: "x" | "linkedin") => {
    const title = data.title ?? "";
    const permalink = `${siteConfig.url}/agent-ops/${id}`;

    const url =
      platform === "x"
        ? `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(permalink)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(permalink)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    setIsShareOpen(false);
  };

  // Sync title DOM content only when not focused (prevents overwriting while typing)
  useEffect(() => {
    if (!isTitleFocused && titleRef.current) {
      titleRef.current.textContent = data.title ?? "";
    }
  }, [data.title, isTitleFocused]);

  // Auto-enter title edit mode when the node is freshly created (e.g. via Tab).
  useEffect(() => {
    if (focusPendingRef.current !== id) return;
    focusPendingRef.current = null;
    const el = titleRef.current;
    if (!el) return;
    el.contentEditable = "true";
    setIsEditingTitle(true);
    setIsTitleFocused(true);
    const timer = setTimeout(() => {
      el.focus();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Open icon picker when triggered from the canvas context menu
  useEffect(() => {
    if (!data.openIconPicker) return;
    updateNodeData(id, { openIconPicker: false });
    setIconPickerOpen(true);
  }, [data.openIconPicker, id, updateNodeData]);

  // Enter edit mode when triggered via keyboard (Enter key while node is selected)
  useEffect(() => {
    if (!data.autoFocusTitle) return;
    updateNodeData(id, { autoFocusTitle: false });
    const el = titleRef.current;
    if (!el) return;
    el.contentEditable = "true";
    setIsEditingTitle(true);
    setIsTitleFocused(true);
    requestAnimationFrame(() => {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  }, [data.autoFocusTitle, id, updateNodeData]);

  // Enter description edit mode when triggered via context menu
  useEffect(() => {
    if (!data.autoFocusDescription) return;
    updateNodeData(id, { autoFocusDescription: false });
    setDescriptionForceEdit(true);
  }, [data.autoFocusDescription, id, updateNodeData]);

  const debouncedSave = (changes: Partial<AgentNodeData>) => {
    if (saveDebounce.current) clearTimeout(saveDebounce.current);
    saveDebounce.current = setTimeout(async () => {
      try {
        await updateNode({ id, ...changes });
      } catch {
        toast.error("Failed to save");
      }
    }, 500);
  };

  const handleFieldChange = (
    field: keyof AgentNodeData,
    value: string | null,
  ) => {
    const before = { [field]: data[field] } as Partial<AgentNodeData>;
    const after = { [field]: value } as Partial<AgentNodeData>;
    updateNodeData(id, after);
    pushHistory({ type: "update", nodeId: id, before, after });
    debouncedSave(after);
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    requestAnimationFrame(() => {
      const el = titleRef.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
  };

  const handleTitleBlur = () => {
    setIsTitleFocused(false);
    setIsEditingTitle(false);
    const el = titleRef.current;
    if (!el) return;
    const newTitle = el.textContent ?? "";
    if (newTitle !== (data.title ?? "")) {
      const before = { title: data.title };
      const after = { title: newTitle };
      updateNodeData(id, after);
      pushHistory({ type: "update", nodeId: id, before, after });
      debouncedSave(after);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      titleRef.current?.blur();
    }
  };

  const handleCardDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterCard.current += 1;
    setIsDraggingOverCard(true);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterCard.current -= 1;
    if (dragCounterCard.current === 0) setIsDraggingOverCard(false);
  };

  const handleCardDrop = () => {
    dragCounterCard.current = 0;
    setIsDraggingOverCard(false);
  };

  const showDropzone = isDraggingOverCard || !!data.imageUrl;
  const isTitleCard = data.cardType === "title";

  return (
    <div className="relative group w-full h-full flex flex-col">
      {selected && (
        <>
          <NodeResizeControl
            position="right"
            variant={ResizeControlVariant.Line}
            minWidth={200}
            style={{
              borderColor: "transparent",
              borderWidth: 6,
              cursor: "ew-resize",
            }}
            onResizeEnd={(_, params) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, style: { ...n.style, width: params.width } }
                    : n,
                ),
              );
              updateNodeSize({ id, width: params.width }).catch(() =>
                toast.error("Failed to save size"),
              );
            }}
          />
          <NodeResizeControl
            position="bottom"
            variant={ResizeControlVariant.Line}
            minHeight={40}
            style={{
              borderColor: "transparent",
              borderWidth: 6,
              cursor: "ns-resize",
            }}
            onResizeEnd={(_, params) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, style: { ...n.style, height: params.height } }
                    : n,
                ),
              );
              updateNodeSize({ id, height: params.height }).catch(() =>
                toast.error("Failed to save size"),
              );
            }}
          />
          <NodeResizeControl
            position="top"
            variant={ResizeControlVariant.Line}
            minHeight={40}
            style={{
              borderColor: "transparent",
              borderWidth: 6,
              cursor: "ns-resize",
            }}
            onResizeEnd={(_, params) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === id
                    ? { ...n, style: { ...n.style, height: params.height } }
                    : n,
                ),
              );
              updateNodeSize({ id, height: params.height }).catch(() =>
                toast.error("Failed to save size"),
              );
            }}
          />
          {(
            ["top-left", "top-right", "bottom-left", "bottom-right"] as const
          ).map((pos) => (
            <NodeResizeControl
              key={pos}
              position={pos}
              variant={ResizeControlVariant.Handle}
              minWidth={200}
              minHeight={40}
              style={{
                width: 12,
                height: 12,
                background: "transparent",
                border: "none",
                cursor:
                  pos === "top-left" || pos === "bottom-right"
                    ? "nwse-resize"
                    : "nesw-resize",
              }}
              onResizeEnd={(_, params) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === id
                      ? {
                          ...n,
                          style: {
                            ...n.style,
                            width: params.width,
                            height: params.height,
                          },
                        }
                      : n,
                  ),
                );
                updateNodeSize({
                  id,
                  width: params.width,
                  height: params.height,
                }).catch(() => toast.error("Failed to save size"));
              }}
            />
          ))}
        </>
      )}
      {/* Top handle — half circle flush against top edge */}
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        isConnectable
        style={{ transform: "translate(-50%, -100%)" }}
        className={cn(
          "!bg-neutral-300 dark:!bg-neutral-600 !border-neutral-300 dark:!border-neutral-500",
          "!w-5 !h-2 !rounded-t-full !rounded-b-none !border-b-0",
          draggable
            ? "opacity-0 group-hover:opacity-100 transition-opacity"
            : "!opacity-0 !pointer-events-none",
        )}
      />
      {/* Left handle — half circle flush against left edge */}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        isConnectable
        style={{ transform: "translate(-100%, -50%)" }}
        className={cn(
          "!bg-neutral-300 dark:!bg-neutral-600 !border-neutral-300 dark:!border-neutral-500",
          "!w-2 !h-5 !rounded-l-full !rounded-r-none !border-r-0",
          draggable
            ? "opacity-0 group-hover:opacity-100 transition-opacity"
            : "!opacity-0 !pointer-events-none",
        )}
      />
      {/* Right handle — half circle flush against right edge */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        isConnectable
        style={{ transform: "translate(100%, -50%)" }}
        className={cn(
          "!bg-neutral-300 dark:!bg-neutral-600 !border-neutral-300 dark:!border-neutral-500",
          "!w-2 !h-5 !rounded-r-full !rounded-l-none !border-l-0",
          draggable
            ? "opacity-0 group-hover:opacity-100 transition-opacity"
            : "!opacity-0 !pointer-events-none",
        )}
      />
      {/* Bottom handle — half circle flush against bottom edge */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        isConnectable
        style={{ transform: "translate(-50%, 100%)" }}
        className={cn(
          "!bg-neutral-300 dark:!bg-neutral-600 !border-neutral-300 dark:!border-neutral-500",
          "!w-5 !h-2 !rounded-b-full !rounded-t-none !border-t-0",
          draggable
            ? "opacity-0 group-hover:opacity-100 transition-opacity"
            : "!opacity-0 !pointer-events-none",
        )}
      />

      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {data.hasChildren && (
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(id);
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500"
            title={data.collapsed ? "Expand children" : "Collapse children"}
          >
            {data.collapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>
        )}

        <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500"
              title="Share"
            >
              <Share2 size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-1.5"
            side="bottom"
            align="end"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleShare("x")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 fill-current shrink-0"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>
              <button
                type="button"
                onClick={() => handleShare("linkedin")}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 fill-current shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {draggable && (
          <GripVertical
            size={14}
            className="text-neutral-400 dark:text-neutral-500 cursor-grab active:cursor-grabbing"
          />
        )}
      </div>

      {/* Card visual container — overflow-hidden must be on an inner div so handles aren't clipped */}
      <div
        className={cn(
          "w-full h-full flex flex-col overflow-hidden bg-white dark:bg-neutral-900 rounded-xl transition-all",
          selected
            ? "shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            : "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)]",
          data.isLinked && !selected && "ring-blue-500/40",
          isTitleCard && "bg-neutral-50 dark:bg-neutral-950",
        )}
        onDragEnter={handleCardDragEnter}
        onDragLeave={handleCardDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCardDrop}
        onContextMenu={!draggable ? (e) => e.preventDefault() : undefined}
      >
        {showDropzone && (
          <div
            className={cn(
              "flex flex-col p-2 pb-0",
              data.imageUrl ? "flex-1 min-h-[120px]" : "flex-none",
            )}
          >
            <ImageDropzone
              value={data.imageUrl}
              onUpload={(url) => handleFieldChange("imageUrl", url)}
              onRemove={() => handleFieldChange("imageUrl", null)}
              className="flex-1 w-full h-full"
              readOnly={!draggable}
            />
          </div>
        )}

        <div
          className={cn(
            "flex flex-col p-2.5 px-3 gap-1 overflow-y-auto min-h-0 shrink [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            !showDropzone && "flex-1 justify-center",
          )}
        >
          {/* Invisible anchor for icon picker triggered via context menu */}
          {!data.icon && (
            <IconPicker
              value={null}
              onSelect={(icon) => {
                if (icon) handleFieldChange("icon", icon);
                setIconPickerOpen(false);
              }}
              open={iconPickerOpen}
              onOpenChange={setIconPickerOpen}
            >
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />
            </IconPicker>
          )}

          <div className="flex flex-col">
            {/* Header: icon (only when set) + editable title + drag handle */}
            <div className="flex gap-1 items-center">
              {data.icon && (
                draggable ? (
                  <IconPicker
                    value={data.icon}
                    onSelect={(icon) => handleFieldChange("icon", icon)}
                  >
                    <button
                      type="button"
                      className="flex-shrink-0 w-5 h-6 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-500"
                      title="Change icon"
                    >
                      <DynamicLucideIcon name={data.icon} size={14} />
                    </button>
                  </IconPicker>
                ) : (
                  <span className="flex-shrink-0 w-5 h-6 flex items-center justify-center text-neutral-500 dark:text-neutral-500">
                    <DynamicLucideIcon name={data.icon} size={14} />
                  </span>
                )
              )}

              <span
                ref={(el) => {
                  titleRef.current = el;
                  if (el && !isTitleFocused) {
                    el.textContent = data.title ?? "";
                  }
                }}
                contentEditable={isEditingTitle}
                suppressContentEditableWarning
                onDoubleClick={handleTitleDoubleClick}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onMouseDown={(e) => isEditingTitle && e.stopPropagation()}
                className={cn(
                  "flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none empty:before:content-['Untitled'] empty:before:text-neutral-400 dark:empty:before:text-neutral-500 min-w-0 break-words",
                  isEditingTitle ? "nodrag cursor-text" : "select-none",
                  isTitleCard &&
                    "text-base font-semibold tracking-tight text-neutral-700 dark:text-neutral-200",
                )}
                data-placeholder="Untitled"
              />
            </div>
            <MarkdownEditor
              value={data.description ?? null}
              onChange={(val) => handleFieldChange("description", val || null)}
              forceEdit={descriptionForceEdit}
              onForceEditConsumed={() => setDescriptionForceEdit(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}, agentNodePropsAreEqual);
