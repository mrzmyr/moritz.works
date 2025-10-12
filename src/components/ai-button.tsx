"use client";

import { Claude, OpenAI } from "@lobehub/icons";
import { Wand } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AiButtonProps {
  children: React.ReactNode;
  prompt: string;
}

export const AiButton = ({ prompt }: AiButtonProps) => {
  const chatGptUrl = `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="shadow-none" size={"icon"} variant={"outline"}>
          <Wand size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem asChild>
          <a
            href={chatGptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer flex flex-col items-start gap-2"
          >
            <div className="flex flex-row gap-2">
              <OpenAI size={20} />
              <span className="font-medium">Open in ChatGPT</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Dive deeper how to solve this
            </span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={claudeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer flex flex-col items-start gap-2"
          >
            <div className="flex flex-row gap-2">
              <Claude size={20} />
              <span className="font-medium">Open in Claude</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Dive deeper how to solve this
            </span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
