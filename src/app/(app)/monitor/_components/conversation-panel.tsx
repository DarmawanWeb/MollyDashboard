"use client";

import { Bot, Loader2, Mic, Send, Sparkles, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  MollyButton,
  MollyConfirmButton,
  MollySwitch,
  MollyTextarea,
} from "@/components/ui/molly";
import { useAssistant } from "@/hooks/use-assistant";
import { clearConversationHistory } from "@/lib/conversation/api";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/use-conversation-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { toast } from "@/stores/use-toast-store";
import type { ConversationEntry } from "@/types";

const TONES = {
  question: {
    border: "border-l-border-strong",
    bg: "bg-mol-tertiary",
    label: "text-txt-tertiary",
  },
  answer: {
    border: "border-l-brand",
    bg: "bg-brand/5",
    label: "text-brand",
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
  tag: ReactNode;
  meta?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn("rounded-r-lg border-l-[3px] px-2.5 py-2", t.border, t.bg)}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            t.label,
          )}
        >
          {tag}
        </span>
        {meta && (
          <span className="font-mono text-[10px] text-txt-muted">{meta}</span>
        )}
      </div>
      <div className="whitespace-pre-wrap text-xs leading-relaxed text-txt-secondary">
        {children}
      </div>
    </div>
  );
}

function Exchange({ entry }: { entry: ConversationEntry }) {
  const engine = entry.engine === "llm" ? "LLM" : "robot";
  return (
    <div className="flex animate-fade-in flex-col gap-1">
      <Bubble
        tone="question"
        tag={
          <>
            {entry.source === "robot" && <Mic size={10} />}
            {entry.source === "robot" ? "Asked in person" : "Question"}
          </>
        }
        meta={clock(entry.at)}
      >
        {entry.question}
      </Bubble>
      {entry.pending && !entry.answer ? (
        <Bubble tone="answer" tag="Molly" meta="thinking…">
          <Loader2 size={12} className="animate-spin text-brand" />
        </Bubble>
      ) : (
        <Bubble
          tone={entry.ok ? "answer" : "failed"}
          tag={entry.ok ? `Molly · ${engine}` : "No answer"}
          meta={
            entry.pending
              ? "answering…"
              : entry.ms === null
                ? undefined
                : `${(entry.ms / 1000).toFixed(1)} s${entry.spoken ? " · spoken" : ""}`
          }
        >
          {entry.answer || "—"}
        </Bubble>
      )}
    </div>
  );
}

/**
 * Ask Molly from the operator page and read every exchange: from this or
 * any other screen, and those asked to the robot in person. Answers come
 * from the external LLM gateway (with the live robot context) when it is
 * configured, otherwise from the robot (/interaction/ask).
 */
export function ConversationPanel() {
  const { ask, busy, engine, status, available } = useAssistant();
  const conversation = useConversationStore((s) => s.entries);
  const language = useSettingsStore((s) => s.interaction.language);
  const speakDefault = useSettingsStore((s) => s.interaction.speakAnswers);

  const [question, setQuestion] = useState("");
  const [speak, setSpeak] = useState(speakDefault);
  const listRef = useRef<HTMLDivElement>(null);
  const last = conversation.at(-1);

  // keep the newest exchange (and its answer as it streams) in view
  useEffect(() => {
    if (!last) return;
    const el = listRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [last]);

  const send = () => {
    const q = question.trim();
    if (!q || busy) return;
    setQuestion("");
    void ask(q, { language: language === "en" ? "en" : "id", speak });
  };

  const clear = async () => {
    const clearedAt = await clearConversationHistory();
    if (clearedAt === null)
      toast.error("Clear failed", "History not reachable");
    else useConversationStore.getState().clear(clearedAt);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[11px] text-txt-tertiary">
        {engine === "llm" ? (
          <Sparkles size={12} className="text-brand" />
        ) : (
          <Bot size={12} className="text-brand" />
        )}
        <span className="truncate">
          {!available
            ? "Robot offline — configure LLM_API_URL to answer without it"
            : engine === "llm"
              ? `External LLM${status?.model ? ` · ${status.model}` : ""}${status?.host ? ` @ ${status.host}` : ""}`
              : "Robot conversation node"}
        </span>
      </div>

      <div
        ref={listRef}
        className="flex h-60 flex-col gap-2 overflow-y-auto pr-1"
      >
        {conversation.length === 0 && (
          <div className="py-8 text-center text-xs text-txt-muted">
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
              send();
            }
          }}
          placeholder={available ? "Ask Molly… (Enter)" : "Robot offline"}
          disabled={!available}
          aria-label="Question for Molly"
          textareaSize="sm"
          rows={2}
          maxLength={500}
          className="max-h-28 min-h-14 w-full pr-10"
        />
        <MollyButton
          size="xs"
          onClick={send}
          disabled={!question.trim() || busy || !available}
          aria-label="Ask"
          title="Ask (Enter)"
          className="absolute right-2 bottom-2"
        >
          {busy ? (
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
        <MollyConfirmButton
          variant="ghost"
          size="xs"
          className="ml-auto"
          disabled={conversation.length === 0 || busy}
          onConfirm={() => void clear()}
          confirmLabel="Clear for everyone?"
        >
          <Trash2 size={10} />
          Clear history
        </MollyConfirmButton>
      </div>
    </div>
  );
}
