"use client";

import { Download, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  MollyButton,
  MollyConfirmButton,
  MollyField,
  MollySelect,
  MollySwitch,
} from "@/components/ui/molly";
import {
  clearConversationHistory,
  fetchAssistantStatus,
  fetchConversations,
} from "@/lib/conversation/api";
import { useConversationStore } from "@/stores/use-conversation-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import { toast } from "@/stores/use-toast-store";
import type { EngineChoice } from "@/types";
import { SettingsSection } from "./settings-section";

const ENGINE_OPTIONS: { value: EngineChoice; label: string }[] = [
  { value: "auto", label: "Auto — external LLM when configured" },
  { value: "llm", label: "External LLM" },
  { value: "robot", label: "Robot conversation node" },
];

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Who answers visitors' questions, whether Molly says the answers out loud,
 * and the shared conversation history (export, clear). The LLM itself is
 * configured on the server (LLM_API_URL, LLM_API_KEY, LLM_MODEL), never in
 * the browser, so its key stays secret.
 */
export function AssistantSection() {
  const { engine, speakAnswers } = useSettingsStore((s) => s.interaction);
  const setInteraction = useSettingsStore((s) => s.setInteraction);
  const status = useConversationStore((s) => s.status);
  const count = useConversationStore((s) => s.entries.length);
  const [checking, setChecking] = useState(false);

  const recheck = async () => {
    setChecking(true);
    const next = await fetchAssistantStatus();
    useConversationStore.getState().setStatus(next);
    setChecking(false);
    if (!next) toast.error("Dashboard server not reachable");
  };

  const exportHistory = async () => {
    const page = await fetchConversations(0);
    if (!page) {
      toast.error("Export failed", "History not reachable");
      return;
    }
    const day = new Date().toISOString().slice(0, 10);
    download(
      `molly-conversations-${day}.json`,
      JSON.stringify(page.entries, null, 2),
      "application/json",
    );
  };

  const clear = async () => {
    const clearedAt = await clearConversationHistory();
    if (clearedAt === null) {
      toast.error("Clear failed", "History not reachable");
      return;
    }
    useConversationStore.getState().clear(clearedAt);
    toast.success("Conversation history cleared");
  };

  const statusText =
    status === null
      ? "Checking the dashboard server…"
      : status.external
        ? `Configured: ${status.model || "default model"} @ ${status.host}`
        : "No LLM_API_URL on the server — the robot answers";

  return (
    <SettingsSection icon={<Sparkles size={18} />} title="AI assistant">
      <div className="flex flex-col gap-3">
        <MollyField
          label="Answers come from"
          htmlFor="assistant-engine"
          hint={statusText}
        >
          <div className="flex gap-2">
            <MollySelect
              id="assistant-engine"
              value={engine}
              onChange={(value) => setInteraction({ engine: value })}
              options={ENGINE_OPTIONS}
              className="flex-1"
            />
            <MollyButton
              variant="ghost"
              onClick={() => void recheck()}
              disabled={checking}
              aria-label="Check the LLM configuration again"
            >
              <RefreshCw size={13} className={checking ? "animate-spin" : ""} />
            </MollyButton>
          </div>
        </MollyField>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-txt-secondary">
              Say answers out loud
            </span>
            <span className="text-[10px] text-txt-muted">
              Default of the chat on the display and the monitor
            </span>
          </div>
          <MollySwitch
            checked={speakAnswers}
            onChange={(on) => setInteraction({ speakAnswers: on })}
            ariaLabel="Say answers out loud"
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
          <span className="label">
            Conversation history · {count} on this screen
          </span>
          <div className="flex flex-wrap gap-2">
            <MollyButton
              variant="secondary"
              size="sm"
              onClick={() => void exportHistory()}
            >
              <Download size={12} />
              Export JSON
            </MollyButton>
            <MollyConfirmButton
              variant="danger"
              size="sm"
              onConfirm={() => void clear()}
              confirmLabel="Clear for every screen?"
            >
              <Trash2 size={12} />
              Clear history
            </MollyConfirmButton>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
