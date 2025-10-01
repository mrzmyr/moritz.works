"use client";

import { Figure } from "@/components/figure";
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";
import { SYSTEM_PROMPT } from "../config";

export const SystemPromptCodeBlock = () => {
  return (
    <Figure>
      <div className="not-prose">
        <CodeBlock
          data={[
            {
              filename: "system-prompt.ts",
              language: "markdown",
              code: SYSTEM_PROMPT.trim(),
            },
          ]}
          defaultValue={"markdown"}
          className="my-4"
        >
          <CodeBlockBody>
            {(item) => (
              <CodeBlockItem
                key={item.language}
                value={item.language}
                lineNumbers={true}
              >
                <CodeBlockContent language={item.language as BundledLanguage}>
                  {item.code}
                </CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </CodeBlock>
      </div>
    </Figure>
  );
};
