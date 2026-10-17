import { create } from "zustand";

import type { NavigationSnapshot, PathPoint, PlannerSnapshot } from "@/types";

interface NavigationStore {
  /** planner/status: walking to a goal */
  planner: PlannerSnapshot;
  /** planner/path: the current plan, map frame */
  path: PathPoint[];
  /** navigation/status: the path follower */
  navigation: NavigationSnapshot;

  setPlanner: (planner: PlannerSnapshot) => void;
  setPath: (path: PathPoint[]) => void;
  setNavigation: (navigation: NavigationSnapshot) => void;
  reset: () => void;
}

/**
 * Path finder and path follower state.
 */
const INITIAL = {
  planner: {
    state: "idle",
    goalId: "",
    goal: null,
    pathLength: 0,
    remaining: 0,
    replans: 0,
    message: "",
  },
  path: [] as PathPoint[],
  navigation: { state: "NAV_INACTIVE", message: "" },
} satisfies Pick<NavigationStore, "planner" | "path" | "navigation">;

export const useNavigationStore = create<NavigationStore>((set) => ({
  ...INITIAL,

  setPlanner: (planner) => set({ planner }),
  setPath: (path) => set({ path }),
  setNavigation: (navigation) => set({ navigation }),
  reset: () => set(INITIAL),
}));
