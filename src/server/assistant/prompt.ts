/**
 * Molly's prompt: who she is and how she talks, what the venue file says,
 * what the robot is doing right now (sent by the dashboard), the last few
 * exchanges, then the visitor's question. Everything the model knows about
 * the place comes from here, so an external LLM answers in context.
 */

import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/constants/brand";
import type { AssistantContext, AssistantTurn, ChatLanguage } from "@/types/ui";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/* ----------------------------------------------------------------------------
 * Venue knowledge file (cached until it changes on disk)
 * ------------------------------------------------------------------------- */

let knowledgeCache: { file: string; mtimeMs: number; text: string } | null =
  null;

const MAX_KNOWLEDGE_CHARS = 12_000;

export function readKnowledge(file: string): string {
  if (!file) return "";
  const full = path.isAbsolute(file)
    ? file
    : path.join(/*turbopackIgnore: true*/ process.cwd(), file);
  try {
    const { mtimeMs } = statSync(full);
    if (knowledgeCache?.file === full && knowledgeCache.mtimeMs === mtimeMs) {
      return knowledgeCache.text;
    }
    const text = readFileSync(full, "utf8")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, MAX_KNOWLEDGE_CHARS);
    knowledgeCache = { file: full, mtimeMs, text };
    return text;
  } catch {
    return "";
  }
}

/* ----------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------- */

const LANGUAGE_RULE: Record<ChatLanguage, string> = {
  id: 'Answer in natural, friendly Bahasa Indonesia. Address the visitor as "Kak" when it fits.',
  en: "Answer in natural, friendly English.",
};

function persona(language: ChatLanguage): string {
  return [
    `You are ${BRAND.robot}, a friendly four-legged (quadruped) robot tour guide.`,
    `You were built by ${BRAND.maker.name} (Ezra Robotics), an Indonesian robotics company, and you welcome and guide visitors at the ${BRAND.partner.name} experience center.`,
    "",
    "How you answer:",
    `- ${LANGUAGE_RULE[language]}`,
    "- Your answers are read aloud by your speaker and shown on a big screen: keep them short, 1 to 3 sentences (at most about 60 words).",
    "- Plain sentences only: no markdown, no lists, no emojis, no links.",
    "- Be warm, cheerful and polite. Speak in the first person as Molly.",
    "- Use the venue knowledge and the live status below. If you do not know something about the venue, say so honestly and suggest asking the staff. Never invent prices, promotions, schedules or names.",
    "- You may answer general questions briefly, but steer back to the visit when it fits.",
    "- Never ask for or repeat personal data. Politely decline anything rude, unsafe or inappropriate.",
  ].join("\n");
}

function clip(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function liveStatus(
  context: AssistantContext,
  now: Date,
  timeZone: string,
): string {
  const when = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  const lines = [`- Local time: ${when} (${timeZone})`];
  if (context.mode === "demo") {
    lines.push("- You are running in demo mode (simulated robot).");
  }
  lines.push(`- You are currently ${context.activity || "standing by"}.`);
  if (context.place) lines.push(`- You are at or near: ${context.place}.`);
  if (context.battery !== null) {
    lines.push(`- Battery: ${Math.round(context.battery)}%.`);
  }
  if (context.visitorsNearby > 0) {
    lines.push(`- Visitors around you: ${context.visitorsNearby}.`);
  }
  const t = context.tour;
  if (t) {
    lines.push(
      `- Tour "${t.name || "guided tour"}" is ${t.state}: stop ${t.index} of ${t.total} is ${t.stop || "on the way"}${t.next ? `, next is ${t.next}` : ", the last stop"}.`,
    );
  }

  const places = context.places
    .map((p) => {
      const about = p.description ? `: ${clip(p.description, 200)}` : "";
      const told = p.narration
        ? ` (what you say there: "${clip(p.narration, 200)}")`
        : "";
      return `- ${p.name}${about}${told}`;
    })
    .join("\n");

  return [
    "Live status (from your sensors, right now):",
    lines.join("\n"),
    places ? `\nPlaces on your tour route:\n${places}` : "",
  ].join("\n");
}

/* ----------------------------------------------------------------------------
 * Messages
 * ------------------------------------------------------------------------- */

export function buildMessages(input: {
  question: string;
  language: ChatLanguage;
  context: AssistantContext;
  history: AssistantTurn[];
  knowledge: string;
  extraPrompt: string;
  timeZone: string;
  now?: Date;
}): ChatMessage[] {
  const sections = [
    persona(input.language),
    input.knowledge ? `Venue knowledge:\n${input.knowledge}` : "",
    liveStatus(input.context, input.now ?? new Date(), input.timeZone),
    input.extraPrompt ? `Additional instructions:\n${input.extraPrompt}` : "",
  ].filter(Boolean);

  const messages: ChatMessage[] = [
    { role: "system", content: sections.join("\n\n") },
  ];
  for (const turn of input.history) {
    messages.push({ role: "user", content: turn.question });
    messages.push({ role: "assistant", content: turn.answer });
  }
  messages.push({ role: "user", content: input.question });
  return messages;
}
