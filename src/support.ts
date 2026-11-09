import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

// A web shop's support bot: one Claude call per customer message.
const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const system = readFileSync(new URL("../prompts/support.md", import.meta.url), "utf8");

export async function answer(message: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 1024,
    output_config: { effort: "low" }, // Opus 5.5 always thinks; a short reply needs little
    system,
    messages: [{ role: "user", content: message }],
  });
  return response.content.map((block) => (block.type === "text" ? block.text : "")).join("");
}
