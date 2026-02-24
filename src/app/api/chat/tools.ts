import { tool } from "ai";
import { z } from "zod";

export interface ExaResult {
  title: string;
  url: string;
  text: string;
  publishedDate?: string;
}

export interface ExaClient {
  searchAndContents(
    query: string,
    opts: { livecrawl?: string; numResults?: number },
  ): Promise<{ results: ExaResult[] }>;
}

export const CardSpecSchema = z.object({
  title: z.string().describe("Card title"),
  description: z.string().optional().describe("Card description in markdown"),
  icon: z.string().optional().describe("Lucide icon name, e.g. 'Zap' or 'Globe'"),
  cardType: z
    .enum(["standard", "title", "link"])
    .optional()
    .default("standard")
    .describe("Card display type"),
  linkUrl: z.string().url().optional().describe("URL for link card type"),
});

export type CardSpec = z.infer<typeof CardSpecSchema>;

/**
 * Creates the chat tool map with an injected Exa client.
 * webSearch executes server-side; addCard is client-side (no execute).
 */
export function createChatTools(exaClient: ExaClient) {
  return {
    webSearch: tool({
      description: "Search the web for up-to-date information",
      inputSchema: z.object({
        query: z.string().min(1).describe("The search query"),
      }),
      execute: async ({ query }) => {
        const { results } = await exaClient.searchAndContents(query, {
          livecrawl: "always",
          numResults: 3,
        });
        return results.map((r) => ({
          title: r.title,
          url: r.url,
          content: r.text.slice(0, 1000),
          publishedDate: r.publishedDate,
        }));
      },
    }),

    addCard: tool({
      description:
        "Add one or more cards to the canvas. If a card is currently selected, the new cards will be added as its children. You can create multiple cards at once.",
      inputSchema: z.object({
        cards: z
          .array(CardSpecSchema)
          .min(1)
          .describe("One or more cards to add to the canvas"),
      }),
      // No execute — handled client-side via onToolCall
    }),
  };
}
