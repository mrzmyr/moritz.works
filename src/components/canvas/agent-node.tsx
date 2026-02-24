"use client";

import { cn } from "@/lib/utils";
import { useReactFlow, type NodeProps } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCanvasActions } from "./canvas-actions-context";
import { useHistoryContext } from "./history-context";
import { DynamicLucideIcon, IconPicker } from "./icon-picker";
import { ImageDropzone } from "./image-dropzone";
import { MarkdownEditor } from "./markdown-editor";
import { NodeHandles } from "./node-handles";
import { NodeResizeControls } from "./node-resize-controls";
import { NodeToolbar } from "./node-toolbar";
import { fetchUrlMetadata } from "@/lib/fetch-url-metadata";
import type { AgentNodeData, AgentNodeType } from "./types";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
    prev.data.isLinked === next.data.isLinked &&
    prev.data.linkUrl === next.data.linkUrl
  );
}

export const AgentNode = memo(function AgentNode({
  id,
  data,
  selected,
  draggable,
}: NodeProps<AgentNodeType>) {
  const { updateNodeData } = useReactFlow();
  const { pushHistory, focusPendingRef, toggleCollapse } = useHistoryContext();
  const { updateNode } = useCanvasActions();
  const titleRef = useRef<HTMLSpanElement>(null);
  const saveDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [descriptionForceEdit, setDescriptionForceEdit] = useState(false);
  const [isDraggingOverCard, setIsDraggingOverCard] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [isFetchingLinkMeta, setIsFetchingLinkMeta] = useState(false);
  const dragCounterCard = useRef(0);

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
    const timer = setTimeout(() => el.focus(), 0);
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

  const handleTitleBlur = async () => {
    setIsTitleFocused(false);
    setIsEditingTitle(false);
    const el = titleRef.current;
    if (!el) return;
    const newTitle = el.textContent ?? "";

    if (isValidHttpUrl(newTitle)) {
      setIsFetchingLinkMeta(true);
      try {
        const meta = await fetchUrlMetadata(newTitle);
        const before = {
          title: data.title,
          icon: data.icon,
          linkUrl: data.linkUrl,
          cardType: data.cardType,
        };
        const after: Partial<AgentNodeData> = {
          title: meta.title,
          icon: meta.faviconUrl,
          linkUrl: newTitle,
          cardType: "link",
        };
        updateNodeData(id, after);
        pushHistory({ type: "update", nodeId: id, before, after });
        debouncedSave(after);
      } catch {
        toast.error("Failed to fetch link metadata");
        if (newTitle !== (data.title ?? "")) {
          const before = { title: data.title };
          const after = { title: newTitle };
          updateNodeData(id, after);
          pushHistory({ type: "update", nodeId: id, before, after });
          debouncedSave(after);
        }
      } finally {
        setIsFetchingLinkMeta(false);
      }
      return;
    }

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
  const isLinkCard = data.cardType === "link" && !!data.linkUrl;

  return (
    <div className="relative group w-full h-full flex flex-col">
      <NodeResizeControls id={id} selected={selected} />
      <NodeHandles draggable={draggable} />
      <NodeToolbar
        id={id}
        data={data}
        draggable={draggable}
        isLinkCard={isLinkCard}
        toggleCollapse={toggleCollapse}
      />

      {/* Card visual container — overflow-hidden must be on an inner div so handles aren't clipped */}
      <div
        className={cn(
          "w-full h-full flex flex-col overflow-hidden rounded-xl",
          isTitleCard
            ? selected && "ring-2 ring-blue-500"
            : [
                "bg-white dark:bg-neutral-900",
                selected
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-neutral-300 dark:ring-neutral-800",
                data.isLinked && !selected && "ring-blue-500/40",
              ],
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
            "flex flex-col overflow-y-auto min-h-0 shrink [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            isTitleCard ? "p-5 gap-2" : "p-2.5 px-3 gap-1",
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
            <div className="flex items-center">
              {data.icon &&
                (draggable ? (
                  <IconPicker
                    value={data.icon}
                    onSelect={(icon) => handleFieldChange("icon", icon)}
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex-shrink-0 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-500",
                        isTitleCard ? "w-10 h-10 mr-1" : "w-5 h-6",
                      )}
                      title="Change icon"
                    >
                      <DynamicLucideIcon
                        name={data.icon}
                        size={isTitleCard ? 28 : 14}
                      />
                    </button>
                  </IconPicker>
                ) : (
                  <span
                    className={cn(
                      "flex-shrink-0 flex items-center justify-center text-neutral-500 dark:text-neutral-500",
                      isTitleCard ? "w-10 h-10 mr-1" : "w-5 h-6",
                    )}
                  >
                    <DynamicLucideIcon
                      name={data.icon}
                      size={isTitleCard ? 28 : 14}
                    />
                  </span>
                ))}

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
                onClick={(e) => {
                  if (isLinkCard && !draggable && data.linkUrl) {
                    e.stopPropagation();
                    window.open(data.linkUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className={cn(
                  "flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none empty:before:content-['Untitled'] empty:before:text-neutral-400 dark:empty:before:text-neutral-500 min-w-0 break-words",
                  isEditingTitle ? "nodrag cursor-text" : "select-none",
                  isTitleCard &&
                    "text-4xl font-bold tracking-tight leading-tight text-neutral-800 dark:text-neutral-100",
                  isLinkCard &&
                    !isEditingTitle &&
                    "underline underline-offset-2 decoration-neutral-300 dark:decoration-neutral-600",
                )}
                data-placeholder="Untitled"
              />

              {isFetchingLinkMeta && (
                <Loader2
                  size={12}
                  className="shrink-0 animate-spin text-neutral-400"
                />
              )}
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
