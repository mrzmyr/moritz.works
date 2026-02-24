import { convertToModelMessages, stepCountIs, streamText, type ToolSet, type UIMessage } from "ai";
import Exa from "exa-js";
import { createChatTools } from "./tools";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an AI assistant embedded in an interactive canvas tool called "Agent Operations".

The canvas contains cards (nodes) that can be connected. Each card has a title, optional description (markdown), optional icon (Lucide icon name), and a card type:
- "standard" — a regular information card
- "title" — a large heading card for grouping
- "link" — a card that links to an external URL

You can help the user by:
1. Adding cards to the canvas using the addCard tool — you can add multiple at once
2. Searching the web for up-to-date information using the webSearch tool
3. Answering questions about any topic

When adding cards: be thoughtful about structure. Use title cards for groups, standard cards for content, and link cards when referencing external resources. If the user has a card selected, new cards will be added as children of that card.

Keep card titles short and descriptive. Descriptions support markdown.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const exa = new Exa(process.env.EXA_API_KEY!);
  const tools = createChatTools(exa as unknown as Parameters<typeof createChatTools>[0]);

  const result = streamText({
    model: "anthropic/claude-4-6-sonnet",
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: tools as ToolSet,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
