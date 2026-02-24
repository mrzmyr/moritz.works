"use client";

import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useChat } from "@ai-sdk/react";
import type { RefObject } from "react";
import { useState } from "react";
import {
  BotIcon,
  CheckIcon,
  GlobeIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import type { CanvasHandle } from "@/components/canvas/canvas";
import type { CardSpec } from "@/components/canvas/add-cards";

interface ChatSidebarProps {
  selectedNodeId: string | null;
  canvasRef: RefObject<CanvasHandle | null>;
  onClose: () => void;
}

export function ChatSidebar({
  selectedNodeId,
  canvasRef,
  onClose,
}: ChatSidebarProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return;

      if (toolCall.toolName === "addCard") {
        const { cards } = toolCall.input as { cards: CardSpec[] };
        try {
          await canvasRef.current?.addCards(cards, selectedNodeId ?? null);
          addToolOutput({
            tool: "addCard",
            toolCallId: toolCall.toolCallId,
            output: `Added ${cards.length} card${cards.length !== 1 ? "s" : ""} to the canvas${selectedNodeId ? " as children" : ""}.`,
          });
        } catch {
          addToolOutput({
            tool: "addCard",
            toolCallId: toolCall.toolCallId,
            state: "output-error",
            errorText: "Failed to add cards to the canvas.",
          });
        }
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <aside className="flex flex-col w-96 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <BotIcon size={16} className="text-neutral-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Canvas AI
          </span>
          {selectedNodeId && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              child mode
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          aria-label="Close chat"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent className="flex flex-col gap-4 p-4">
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<BotIcon size={24} />}
              title="Canvas AI"
              description={'Ask me anything, search the web, or say \u201cadd a card about X\u201d to add cards to your canvas.'}
            />
          )}
          {messages.map((message) => (
            <Message from={message.role === "user" ? "user" : "assistant"} key={message.id}>
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <MessageContent
                      key={i}
                      className={cn(
                        message.role === "user"
                          ? "rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm"
                          : "bg-transparent p-0 text-sm",
                      )}
                    >
                      <MessageResponse>{part.text}</MessageResponse>
                    </MessageContent>
                  );
                }

                if (part.type === "tool-webSearch") {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 py-1"
                    >
                      {part.state === "input-streaming" || part.state === "input-available" ? (
                        <>
                          <Loader2Icon size={12} className="animate-spin" />
                          <span>Searching the web…</span>
                        </>
                      ) : part.state === "output-available" ? (
                        <>
                          <SearchIcon size={12} />
                          <span>
                            Found{" "}
                            {
                              (part.output as { title: string; url: string }[])
                                .length
                            }{" "}
                            results
                          </span>
                          <GlobeIcon size={12} className="ml-auto" />
                        </>
                      ) : (
                        <>
                          <SearchIcon size={12} />
                          <span>Search failed</span>
                        </>
                      )}
                    </div>
                  );
                }

                if (part.type === "tool-addCard") {
                  const input = part.input as { cards: CardSpec[] } | undefined;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 py-1"
                    >
                      {part.state === "input-streaming" || part.state === "input-available" ? (
                        <>
                          <Loader2Icon size={12} className="animate-spin" />
                          <span>Adding cards…</span>
                        </>
                      ) : part.state === "output-available" ? (
                        <>
                          <CheckIcon size={12} className="text-green-500" />
                          <span>
                            Added {input?.cards?.length ?? 1} card
                            {(input?.cards?.length ?? 1) !== 1 ? "s" : ""}
                            {selectedNodeId ? " as children" : ""}
                          </span>
                          <PlusIcon size={12} className="ml-auto" />
                        </>
                      ) : (
                        <>
                          <XIcon size={12} className="text-red-500" />
                          <span>Failed to add cards</span>
                        </>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-3">
        <PromptInput
          className="rounded-xl border border-neutral-200 dark:border-neutral-700"
          onSubmit={(msg) => {
            if (!msg.text.trim()) return;
            sendMessage({ text: msg.text });
            setInput("");
          }}
        >
          <PromptInputTextarea
            className="text-sm min-h-9 px-3 py-2"
            placeholder={'Ask or say \u201cadd a card about\u2026\u201d'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <PromptInputFooter className="justify-end px-2 pb-2">
            <PromptInputSubmit
              status={isStreaming ? "streaming" : "ready"}
              disabled={!input.trim() && !isStreaming}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-2">
          ⌘I to toggle
        </p>
      </div>
    </aside>
  );
}
