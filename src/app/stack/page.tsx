"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { Draggable } from "@/components/draggable";
import { StackItem } from "@/components/stack-item";

interface StackItemData {
  id: string;
  title: string;
  query?: string;
  src?: string;
  x: number;
  y: number;
}

const initialItems: StackItemData[] = [
  { id: "figma", query: "figma.com", title: "Figma", x: 50, y: 100 },
  { id: "cursor", query: "cursor.com", title: "Cursor", x: 200, y: 100 },
  { id: "notion", query: "notion.so", title: "Notion", x: 350, y: 100 },
  { id: "linear", query: "linear.app", title: "Linear", x: 500, y: 100 },
  { id: "slack", query: "slack.com", title: "Slack", x: 50, y: 250 },
  { id: "posthog", query: "posthug.com", title: "PostHog", x: 200, y: 250 },
  { id: "spotify", query: "spotify.com", title: "Spotify", x: 350, y: 250 },
  { id: "loom", query: "loom.com", title: "Loom", x: 500, y: 250 },
  {
    id: "1password",
    src: "https://cdn.brandfetch.io/1password.com/w/512/h/512/theme/light/symbol?c=1id5pNSx4z5GN49Aj4x",
    title: "1Password",
    x: 50,
    y: 400,
  },
  { id: "raycast", query: "raycast.com", title: "Raycast", x: 200, y: 400 },
  { id: "oku", query: "oku.club", title: "Oku", x: 350, y: 400 },
  { id: "nextjs", query: "nextjs.org", title: "Next.js", x: 500, y: 400 },
];

export default function Stack() {
  const [items, setItems] = useState(initialItems);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    setItems((items) =>
      items.map((item) => {
        if (item.id === active.id) {
          return {
            ...item,
            x: item.x + delta.x,
            y: item.y + delta.y,
          };
        }
        return item;
      }),
    );
  };

  return (
    <div className="h-screen min-w-screen overflow-hidden fixed inset-0">
      <div
        className="absolute bg-cover bg-center h-screen w-screen pointer-events-none"
        style={{ backgroundImage: "url('/static/images/stack-bg.jpg')" }}
      />
      <DndContext onDragEnd={handleDragEnd}>
        <div className="max-w-3xl mx-auto h-full">
          <div className="relative w-full h-full">
            {items.map((item) => (
              <Draggable key={item.id} id={item.id} x={item.x} y={item.y}>
                <StackItem
                  {...(item.query
                    ? { query: item.query }
                    : { src: item.src || "" })}
                  title={item.title}
                />
              </Draggable>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
