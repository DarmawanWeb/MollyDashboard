"use client";

import { Loader2, Send, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { MollyButton, MollySwitch, MollyTextarea } from "@/components/ui/molly";
import { useRobotApi } from "@/hooks/use-robot-api";
import { cn } from "@/lib/utils";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import type { ConversationEntry } from "@/types";

const TONES = {
  question: {
    border: "border-l-border-strong",
    bg: "bg-mol-secondary",
    label: "text-txt-tertiary",
  },
  answer: {
    border: "border-l-violet",
    bg: "bg-violet/5",
    label: "text-violet",
  },
  failed: {
    border: "border-l-red",
    bg: "bg-red/5",
    label: "text-red",
  },
} as const;

function clock(at: number): string {
  return new Date(at).toLocaleTimeString("en-GB", { hour12: false });
}

function Bubble({
  tone,
  tag,
  meta,
  children,
}: {
  tone: keyof typeof TONES;
  tag: string;
  meta?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div className={cn("px-2.5 py-2 border-l-[3px]", t.border, t.bg)}>
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "font-mono text-[10px] font-bold uppercase tracking-widest",
            t.label,
          )}
        >
          {tag}
        </span>
        {meta && (
          <span className="font-mono text-[10px] text-txt-muted">{meta}</span>
        )}
      </div>
      <div className="text-xs text-txt-secondary leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

function Exchange({ entry }: { entry: ConversationEntry }) {
  return (
    <div className="flex flex-col gap-1 animate-fade-in">
      <Bubble tone="question" tag="Question" meta={clock(entry.at)}>
        {entry.question}
      </Bubble>
      {entry.pending ? (
        <Bubble tone="answer" tag="Molly" meta="thinking…">
          <Loader2 size={12} className="animate-spin text-violet" />
        </Bubble>
      ) : (
        <Bubble
          tone={entry.ok ? "answer" : "failed"}
          tag={entry.ok ? "Molly" : "No answer"}
          meta={
            entry.ms === null ? undefined : `${(entry.ms / 1000).toFixed(1)} s`
          }
        >
          {entry.answer || "—"}
        </Bubble>
      )}
    </div>
  );
}

/**
 * Ask the conversation model about the site (/interaction/ask) and read
 * every exchange the robot answered (interaction/conversation), including
 * those asked from other dashboards.
 */
export function ConversationPanel() {
  const api = useRobotApi();
  const conversation = useInteractionStore((s) => s.conversation);
  const addConversation = useInteractionStore((s) => s.addConversation);
  const resolveConversation = useInteractionStore((s) => s.resolveConversation);
  const clearConversation = useInteractionStore((s) => s.clearConversation);
  const language = useSettingsStore((s) => s.interaction.language);

  const [question, setQuestion] = useState("");
  const [speak, setSpeak] = useState(true);
  const askCount = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const waiting = conversation.some((e) => e.pending);
  const last = conversation.at(-1);

  // keep the newest exchange (and its answer when it lands) in view
  useEffect(() => {
    if (!last) return;
    const el = listRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [last]);

  const ask = async () => {
    const q = question.trim();
    if (!q || waiting) return;
    askCount.current += 1;
    const id = `ask_${Date.now()}_${askCount.current}`;
    const started = performance.now();
    addConversation({
      id,
      question: q,
      answer: "",
      ms: null,
      ok: true,
      pending: true,
      at: Date.now(),
    });
    setQuestion("");
    try {
      const res = await api.ask(q, language, speak);
      resolveConversation(id, {
        answer: res.answer || res.message,
        ok: res.success && res.answer !== "",
        ms: Math.round(performance.now() - started),
      });
    } catch (err) {
      resolveConversation(id, {
        answer: err instanceof Error ? err.message : String(err),
        ok: false,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={listRef}
        className="h-60 overflow-y-auto flex flex-col gap-2 pr-1"
      >
        {conversation.length === 0 && (
          <div className="text-xs text-txt-muted text-center py-8">
            No questions yet
          </div>
        )}
        {conversation.map((entry) => (
          <Exchange key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="relative">
        <MollyTextarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void ask();
            }
          }}
          placeholder="Ask Molly about this place… (Enter)"
          aria-label="Question for Molly"
          textareaSize="sm"
          rows={2}
          className="w-full min-h-14 max-h-28 pr-10"
        />
        <MollyButton
          size="xs"
          onClick={ask}
          disabled={!question.trim() || waiting}
          aria-label="Ask"
          title="Ask (Enter)"
          className="absolute bottom-2 right-2"
        >
          {waiting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
        </MollyButton>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-txt-secondary">Speak the answer</span>
        <MollySwitch
          checked={speak}
          onChange={setSpeak}
          ariaLabel="Speak the answer"
          size="sm"
        />
        <MollyButton
          variant="ghost"
          size="xs"
          className="ml-auto"
          disabled={conversation.length === 0 || waiting}
          onClick={clearConversation}
        >
          <Trash2 size={10} />
          Clear
        </MollyButton>
      </div>
    </div>
  );
}
