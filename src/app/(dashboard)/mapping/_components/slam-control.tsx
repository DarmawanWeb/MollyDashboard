"use client";

import { Navigation, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/feedback";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton } from "@/components/ui/molly/button";
import { getRos, SERVICES, TOPICS } from "@/lib/ros";

type SlamState = "idle" | "running" | "saving";

/**
 * SLAM start/stop + map save controls.
 *
 * Owns its own state because no other component in the page reacts to it.
 * If FSM coordination needs SLAM state later, lift to useRobotStore.
 */
export function SlamControl() {
  const [slamState, setSlamState] = useState<SlamState>("idle");

  const handleToggle = () => {
    if (slamState === "idle") {
      setSlamState("running");
      getRos().publish(TOPICS.SLAM_START, {});
      toast.info("SLAM started", "Drive the robot to map the area");
    } else if (slamState === "running") {
      setSlamState("idle");
      getRos().publish(TOPICS.SLAM_STOP, {});
      toast.info("SLAM stopped");
    }
  };

  const handleSave = () => {
    setSlamState("saving");
    const name = `map_${Date.now()}`;
    getRos()
      .callService(SERVICES.SAVE_MAP, { name })
      .then(() => {
        setSlamState("idle");
        toast.success("Map saved", name);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[slam] save map failed:", err);
        setSlamState("running");
        toast.error(
          "Failed to save map",
          err instanceof Error ? err.message : String(err),
        );
      });
  };

  const statusLabel =
    slamState === "idle"
      ? "SLAM idle"
      : slamState === "running"
        ? "SLAM active — building map"
        : "Saving map…";

  return (
    <AppSection title="SLAM Control" icon={<Navigation size={16} />}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <MollyButton
            variant={slamState === "running" ? "danger" : "primary"}
            onClick={handleToggle}
            disabled={slamState === "saving"}
            className="flex-1 justify-center"
          >
            {slamState === "running" ? "Stop SLAM" : "Start SLAM"}
          </MollyButton>
          <MollyButton
            variant="ghost"
            onClick={handleSave}
            disabled={slamState !== "running"}
            className="gap-1.5"
          >
            <Save size={13} />
            Save Map
          </MollyButton>
        </div>
        <div className="panel-inset px-3 py-2 flex items-center gap-2">
          <div
            aria-hidden
            className={`w-2 h-2 rounded-full ${
              slamState === "running"
                ? "bg-green motion-safe:animate-pulse"
                : "bg-txt-muted"
            }`}
          />
          <span
            aria-live="polite"
            className="font-mono text-xs text-txt-secondary"
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </AppSection>
  );
}
