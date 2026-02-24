import { describe, test, expect, mock } from "bun:test";
import { createChatTools } from "./tools";
import type { ExaClient } from "./tools";

const makeExaClient = (results = [
  { title: "Result 1", url: "https://example.com", text: "Some content here", publishedDate: "2024-01-01" },
]): ExaClient => ({
  searchAndContents: mock(async () => ({ results })),
});

describe("createChatTools", () => {
  test("webSearch tool calls searchAndContents and returns formatted results", async () => {
    const exa = makeExaClient();
    const tools = createChatTools(exa);

    expect(tools.webSearch).toBeDefined();
    expect(typeof tools.webSearch.execute).toBe("function");

    const result = await tools.webSearch.execute!({ query: "test query" }, {
      messages: [],
      toolCallId: "call-1",
    } as never);

    expect(exa.searchAndContents).toHaveBeenCalledWith(
      "test query",
      expect.objectContaining({ numResults: 3 }),
    );
    expect(Array.isArray(result)).toBe(true);
    const first = (result as { title: string; url: string; content: string }[])[0];
    expect(first.title).toBe("Result 1");
    expect(first.url).toBe("https://example.com");
    expect(first.content).toBeString();
  });

  test("addCard tool has no execute property (is client-side)", () => {
    const tools = createChatTools(makeExaClient());

    expect(tools.addCard).toBeDefined();
    expect(tools.addCard.execute).toBeUndefined();
  });
});
