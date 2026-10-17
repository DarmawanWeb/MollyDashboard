"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while the server HTML hydrates, true from the next render on.
 *
 * Stores render their initial state during hydration (zustand hands React
 * `getInitialState` as the server snapshot), so values saved in
 * localStorage only arrive with the render after it. Gate effects that must
 * see saved settings (opening the robot connection) on this flag.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
