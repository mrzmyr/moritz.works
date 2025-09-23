import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  type BundledLanguage,
} from "@/components/ui/kibo-ui/code-block";

const code = `
You are a filter parser.
Parse natural language filter descriptions into structured JSON format.

If you see multiple conditions, return an array of conditions.

# Examples

- "bugs older than 3 months" (label: include, value: bug; date: before, value: 3, unit: months)
- "label not includes bug and status done" (label: not_include, value: bug, status: equals, value: done)

If the user asks for a filter that is not possible, return an empty array.

// Provide date, to support relative date queries ("bugs since last week")
Today's date is \${new Date().toISOString().split("T")[0]}.
\`;
`;

export const SystemPromptCodeBlock = () => {
  return (
    <div className="not-prose">
      <CodeBlock
        data={[
          {
            filename: "config.ts",
            language: "typescript",
            code: code.trim(),
          },
        ]}
        defaultValue={"typescript"}
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
  );
};
