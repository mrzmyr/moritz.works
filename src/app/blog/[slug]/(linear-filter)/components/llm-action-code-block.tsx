import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";

const code = `
export async function parseFilterAction({ input }: { input: string }) {
  const completion = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    response_format: zodResponseFormat(parsedFilter, "parsed_filter"),
  });

  const parsed_filter = completion.choices[0].message.parsed;

  if (!parsed_filter) {
    return { success: false, error: "No parsed filter returned" };
  }

  return { success: true, data: parsed_filter };
}
`;

export const LlmActionCodeBlock = () => {
  return (
    <div className="not-prose">
      <CodeBlock
        data={[
          {
            filename: "actions.ts",
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
