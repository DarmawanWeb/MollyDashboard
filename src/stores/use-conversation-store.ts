import { create } from "zustand";
import type {
  AssistantStatus,
  ConversationEntry,
  StoredConversation,
} from "@/types";

const MAX_ENTRIES = 400;

interface ConversationStore {
  /** Oldest first */
  entries: ConversationEntry[];
  /** null until /api/chat answered */
  status: AssistantStatus | null;
  /** Highest updatedAt seen from the server (poll watermark) */
  syncedUntil: number;
  /** Last clear the screen knows of (server clock) */
  clearedAt: number;
  /** The history was loaded once */
  loaded: boolean;

  setStatus: (status: AssistantStatus | null) => void;
  /** Add or replace by id. */
  upsert: (entry: ConversationEntry) => void;
  patch: (id: string, patch: Partial<ConversationEntry>) => void;
  /** Swap a local entry for the server's version of it (maybe another id). */
  adopt: (localId: string, stored: StoredConversation) => void;
  /** Entries from the server; local pending ones win. */
  merge: (stored: StoredConversation[], clearedAt: number) => void;
  clear: (clearedAt: number) => void;
}

function sorted(list: ConversationEntry[]): ConversationEntry[] {
  return [...list].sort((a, b) => a.at - b.at).slice(-MAX_ENTRIES);
}

function watermark(list: ConversationEntry[], prev: number): number {
  return list.reduce((max, e) => Math.max(max, e.updatedAt), prev);
}

/**
 * Questions and answers with Molly, mirrored from the server's history
 * (every screen sees the same) plus what this screen is asking right now.
 */
export const useConversationStore = create<ConversationStore>((set) => ({
  entries: [],
  status: null,
  syncedUntil: 0,
  clearedAt: 0,
  loaded: false,

  setStatus: (status) => set({ status }),

  upsert: (entry) =>
    set((s) => ({
      entries: sorted([...s.entries.filter((e) => e.id !== entry.id), entry]),
    })),

  patch: (id, patch) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),

  adopt: (localId, stored) =>
    set((s) => {
      const local = s.entries.find((e) => e.id === localId);
      const rest = s.entries.filter(
        (e) => e.id !== localId && e.id !== stored.id,
      );
      const entry: ConversationEntry = {
        ...stored,
        spoken: stored.spoken || (local?.spoken ?? false),
        pending: false,
      };
      return {
        entries: sorted([...rest, entry]),
        syncedUntil: Math.max(s.syncedUntil, stored.updatedAt),
      };
    }),

  merge: (stored, clearedAt) =>
    set((s) => {
      let entries = s.entries;
      if (clearedAt > s.clearedAt) {
        // cleared elsewhere: keep only what is still being asked here
        entries = entries.filter((e) => e.pending || e.at > clearedAt);
      }
      const byId = new Map(entries.map((e) => [e.id, e]));
      for (const e of stored) {
        const local = byId.get(e.id);
        if (local?.pending) continue;
        byId.set(e.id, {
          ...e,
          spoken: e.spoken || (local?.spoken ?? false),
          pending: false,
        });
      }
      const next = sorted([...byId.values()]);
      return {
        entries: next,
        loaded: true,
        clearedAt: Math.max(s.clearedAt, clearedAt),
        syncedUntil: watermark(
          stored.map((e) => ({ ...e, pending: false })),
          s.syncedUntil,
        ),
      };
    }),

  clear: (clearedAt) =>
    set((s) => ({
      entries: s.entries.filter((e) => e.pending),
      clearedAt: Math.max(s.clearedAt, clearedAt),
    })),
}));
