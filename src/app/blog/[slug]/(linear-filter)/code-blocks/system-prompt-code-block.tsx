import { SimpleCodeBlock } from "@/components/simple-code-block";
import { SYSTEM_PROMPT } from "../config";

export const SystemPromptCodeBlock = () => {
  return <SimpleCodeBlock lang="markdown">{SYSTEM_PROMPT}</SimpleCodeBlock>;
};
