"use client";

import { useState } from "react";

type Primitive = string | number | boolean;

/**
 * A local edit of a stored value: shows the stored value until the user
 * types, then the draft. Unlike `useState(stored)` it never freezes the
 * value of the first render (the initial store state during hydration),
 * and it follows the store when the value changes elsewhere.
 *
 *   const url = useDraft(connection.rosbridgeUrl);
 *   <MollyInput value={url.value} onChange={(e) => url.set(e.target.value)} />
 *   save(url.value); url.reset();
 */
export function useDraft<T extends Primitive>(stored: T) {
  const [draft, setDraft] = useState<T | null>(null);
  const value = draft ?? stored;
  return {
    value,
    dirty: draft !== null && draft !== stored,
    set: (next: T) => setDraft(next),
    reset: () => setDraft(null),
  };
}
