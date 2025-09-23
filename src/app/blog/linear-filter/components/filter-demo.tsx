import { FilterType, type ParsedFilter } from "@/app/blog/linear-filter/types";
import { DemoBox } from "@/components/demo-box";
import { LinearFilter } from "@/app/blog/linear-filter/components/linear-filter";
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
import { useCallback, useState } from "react";

export const FilterDemo = () => {
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter | null>({
    conditions: [
      {
        name: "Label" as const,
        type: FilterType.LABEL,
        operator: "not_include" as const,
        value: ["bug" as const, "feature" as const],
        selectedValue: ["bug" as const, "feature" as const],
      },
      {
        name: "Status" as const,
        type: FilterType.STATUS,
        operator: "equals" as const,
        value: ["done" as const],
        selectedValue: ["done" as const],
      },
    ],
    raw_input: "label not includes bug or feature and status done",
  });

  const handleFiltersChange = useCallback((filters: ParsedFilter | null) => {
    setParsedFilters(filters);
  }, []);

  return (
    <>
      <DemoBox>
        <LinearFilter onFiltersChange={handleFiltersChange} />
      </DemoBox>

      {parsedFilters && parsedFilters.conditions.length > 0 && (
        <div className="mt-4">
          <CodeBlock
            data={[
              {
                filename: "parsed_filters",
                language: "json",
                code: JSON.stringify(parsedFilters, null, 2),
              },
            ]}
            defaultValue={"json"}
          >
            <CodeBlockHeader>
              <CodeBlockFiles>
                {(item) => (
                  <CodeBlockFilename key={item.language} value={item.language}>
                    {item.filename}
                  </CodeBlockFilename>
                )}
              </CodeBlockFiles>
            </CodeBlockHeader>
            <CodeBlockBody>
              {(item) => (
                <CodeBlockItem
                  key={item.language}
                  value={item.language}
                  lineNumbers={false}
                >
                  <CodeBlockContent language={item.language as BundledLanguage}>
                    {item.code}
                  </CodeBlockContent>
                </CodeBlockItem>
              )}
            </CodeBlockBody>
          </CodeBlock>
        </div>
      )}
    </>
  );
};
