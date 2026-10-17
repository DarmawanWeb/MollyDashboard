"use client";

import type { ReactNode } from "react";
import { useMockMode } from "@/hooks/use-mock-mode";
import { useRosSync } from "@/hooks/use-ros-sync";

/**
 * Pipes the robot's topics into the domain stores while a real robot is
 * connected (the SimulationLayer does the same for the mock).
 */
export function RosSyncLayer({ children }: { children: ReactNode }) {
  useRosSync(!useMockMode());
  return <>{children}</>;
}
