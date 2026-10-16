"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { useRef, useState } from "react";
import { MollyButton, MollyTextarea } from "@/components/ui/molly";
import { useCommsStore } from "@/stores/use-comms-store";

export function CommsPanel() {
  const { addMessage, sttActive, toggleSTT } = useCommsStore();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const createMessage = (text: string) => {
    addMessage({
      role: "operator",
      text,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour12: false,
      }),
    });
  };

  const send = () => {
    if (!input.trim()) return;

    createMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex gap-1.5">
        <MollyTextarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={sttActive ? "Listening via STT…" : "Send command…"}
          aria-label="Operator command input"
          className="flex-1 text-xs min-h-15 max-h-30 pr-10"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <MollyButton
          variant="primary"
          size="xs"
          onClick={send}
          disabled={!input.trim()}
          aria-label="Send command"
          title="Send command (Enter)"
          className="absolute bottom-2 right-2"
        >
          <Send size={13} aria-hidden="true" />
        </MollyButton>
      </div>

      <MollyButton
        variant={sttActive ? "danger" : "ghost"}
        onClick={toggleSTT}
        className={`w-full justify-center ${
          sttActive ? "motion-safe:animate-pulse" : ""
        }`}
      >
        {sttActive ? (
          <>
            <MicOff size={13} aria-hidden="true" /> Listening (STT Active)
          </>
        ) : (
          <>
            <Mic size={13} aria-hidden="true" /> Enable Voice Input
          </>
        )}
      </MollyButton>
    </div>
  );
}
