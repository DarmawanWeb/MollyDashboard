"use client";

import { useEffect } from "react";
import {
  fetchAssistantStatus,
  fetchConversations,
} from "@/lib/conversation/api";
import { useConversationStore } from "@/stores/use-conversation-store";

const POLL_MS = 4000;
const STATUS_MS = 60_000;

/**
 * Keep this screen's conversation history in step with the server: load it
 * once, then poll for entries other screens (or the LLM gateway) added and
 * for a clear. Also learns whether the external LLM is configured.
 */
export function useConversationSync(): void {
  useEffect(() => {
    let stopped = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const refreshStatus = async () => {
      const status = await fetchAssistantStatus();
      if (!stopped && status) useConversationStore.getState().setStatus(status);
    };

    const poll = async () => {
      if (!document.hidden) {
        const { syncedUntil, loaded } = useConversationStore.getState();
        const page = await fetchConversations(loaded ? syncedUntil : 0);
        if (!stopped && page) {
          useConversationStore.getState().merge(page.entries, page.clearedAt);
        }
      }
      if (!stopped) pollTimer = setTimeout(poll, POLL_MS);
    };

    void refreshStatus();
    void poll();
    const statusTimer = setInterval(refreshStatus, STATUS_MS);

    return () => {
      stopped = true;
      if (pollTimer) clearTimeout(pollTimer);
      clearInterval(statusTimer);
    };
  }, []);
}
