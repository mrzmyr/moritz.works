import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";

const code = `
const labelFilter = z.object({
  name: z.literal("Label"),
  type: z.literal(FilterType.LABEL),
  operator: z.enum(["include", "not_include"]),
  value: z.array(z.enum(["bug", "feature", "customer-support"])),
  selectedValue: z.array(z.enum(["bug", "feature", "customer-support"])),
});

// … same for status and date filters

// Union of all possible filter types
const filterCondition = z.discriminatedUnion("type", [
  dateFilter,
  labelFilter, 
  statusFilter,
]);

// Final parsed output structure
export const parsedFilter = z.object({
  conditions: z.array(filterCondition),
  raw_input: z.string(),
});
`;

export const FilterSchemaCodeBlock = () => {
  return (
    <div className="not-prose">
      <CodeBlock
        data={[
          {
            filename: "types.ts",
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

const exampleCode = `
{
  "conditions": [
    {
      "name": "Label",
      "type": "label",
      "operator": "include",
      "value": ["bug", "feature"],
    },
    {
      "name": "Status",
      "type": "status",
      "operator": "equals",
      "value": ["done"],
    }
  ],
  "raw_input": "label include bug and feature"
}
`;

export const FilterSchemaExampleCodeBlock = () => {
  return (
    <div className="not-prose">
      <CodeBlock
        data={[
          {
            filename: "parsed_filters",
            language: "typescript",
            code: exampleCode.trim(),
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
