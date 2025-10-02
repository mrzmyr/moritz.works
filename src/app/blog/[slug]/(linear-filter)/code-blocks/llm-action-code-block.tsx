import { SimpleCodeBlock } from "@/components/simple-code-block";

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
`.trim();

export const LlmActionCodeBlock = () => {
  return <SimpleCodeBlock lang="typescript">{code}</SimpleCodeBlock>;
};
