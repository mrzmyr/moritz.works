import { SimpleCodeBlock } from "@/components/simple-code-block";

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
`.trim();

export const FilterSchemaCodeBlock = () => {
  return <SimpleCodeBlock lang="typescript">{code}</SimpleCodeBlock>;
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
`.trim();

export const FilterSchemaExampleCodeBlock = () => {
  return <SimpleCodeBlock lang="typescript">{exampleCode}</SimpleCodeBlock>;
};
