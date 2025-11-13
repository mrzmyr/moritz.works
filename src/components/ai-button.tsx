"use client";

import {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInScira,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
} from "@/components/ai-elements/open-in-chat";

export const AiButton = ({ prompt }: { prompt: string }) => {
  return (
    <OpenIn query={prompt}>
      <OpenInTrigger />
      <OpenInContent>
        <OpenInChatGPT />
        <OpenInClaude />
        <OpenInCursor />
        <OpenInT3 />
        <OpenInScira />
        <OpenInv0 />
      </OpenInContent>
    </OpenIn>
  );
};
