import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";

const code = `
Parse natural language filter descriptions into structured JSON format.
If you see multiple conditions, return an array of conditions.
If the user asks for a filter that is not possible, return an empty array.

# Examples
- "bugs older than 3 months"  
  (label: include, value: bug; date: before, value: 3, unit: months)  

- "label not includes bug and status done"  
  (label: not_include, value: bug; status: equals, value: done)  

Today's date is \${new Date().toISOString().split("T")[0]}
`;

export const SystemPromptCodeBlock = () => {
  return (
    <div className="not-prose">
      <CodeBlock
        data={[
          {
            filename: "system-prompt.ts",
            language: "markdown",
            code: code.trim(),
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
  );
};
