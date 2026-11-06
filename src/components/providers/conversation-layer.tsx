"use client";

import type { ReactNode } from "react";
import { useConversationSync } from "@/hooks/use-conversation-sync";

/** Shared conversation history and LLM status for every page. */
export function ConversationLayer({ children }: { children: ReactNode }) {
  useConversationSync();
  return <>{children}</>;
}
