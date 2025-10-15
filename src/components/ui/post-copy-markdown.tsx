"use client";

import { Claude, OpenAI } from "@lobehub/icons";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export const PostCopyMarkdown = ({
  content,
  url,
}: {
  content: string;
  url: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const prompt = `Read from this URL: ${url} and explain it to me.`;

  const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        onClick={copyToClipboard}
        className="flex gap-2 items-center"
      >
        {isCopied ? "Copied" : "Copy page"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="More actions" className="!pl-2">
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="[--radius:1rem] min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a
                href={chatGptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start"
              >
                <div className="flex flex-row gap-2 items-center">
                  <OpenAI size={18} />
                  <span className="font-medium">Open in ChatGPT</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Ask question about this page
                </span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={claudeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start"
              >
                <div className="flex flex-row gap-2 items-center">
                  <Claude size={18} />
                  <span className="font-medium">Open in Claude</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Ask question about this page
                </span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};
