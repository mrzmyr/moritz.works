import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  type CodeBlockData,
  CodeBlockItem,
} from "@/components/ui/kibo-ui/code-block";
import { cn } from "@/lib/utils";

export const FastCodeBlock = ({
  data,
  defaultValue,
  className,
}: {
  data: CodeBlockData[];
  defaultValue: string;
  className?: string;
}) => {
  return (
    <CodeBlock
      data={data.map((item) => ({
        ...item,
        code: item.code.trim(),
      }))}
      defaultValue={defaultValue}
      className={cn(className, "not-prose")}
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
  );
};
