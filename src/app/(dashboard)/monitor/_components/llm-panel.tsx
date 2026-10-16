"use client";

import { useEffect, useRef } from "react";
import { useCommsStore } from "@/stores/use-comms-store";

const ROLE_MAP = {
  visitor: {
    border: "border-l-border-strong",
    bg: "bg-mol-secondary",
    label: "text-txt-tertiary",
    tag: "VISITOR",
  },
  molly: {
    border: "border-l-violet",
    bg: "bg-violet/5",
    label: "text-violet",
    tag: "MOLLY",
  },
  system: {
    border: "border-l-amber",
    bg: "bg-amber/5",
    label: "text-amber",
    tag: "SYSTEM",
  },
  operator: {
    border: "border-l-cyan",
    bg: "bg-cyan/5",
    label: "text-cyan",
    tag: "OPERATOR",
  },
} as const;

export function LLMPanel() {
  const messages = useCommsStore((s) => s.messages);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  return (
    <div
      className="flex-1 overflow-y-scroll flex flex-col gap-1.5 pr-1 h-full"
      ref={ref}
    >
      {messages.length === 0 && (
        <div className="text-xs text-txt-muted text-center py-8">
          No messages yet
        </div>
      )}

      {messages.map((msg, i) => {
        const s = ROLE_MAP[msg.role];

        return (
          <div
            key={`${msg.timestamp}-${i}`}
            className={`px-2.5 py-2 border-l-[3px] ${s.border} ${s.bg} animate-fade-in`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[10px] font-bold uppercase tracking-widest ${s.label}`}
                >
                  {s.tag}
                </span>
              </div>

              <span className="font-mono text-[10px] text-txt-muted">
                {msg.timestamp}
              </span>
            </div>

            <p className="text-xs text-txt-secondary leading-relaxed">
              {msg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
