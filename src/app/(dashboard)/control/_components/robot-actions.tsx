"use client";

import { Loader2 } from "lucide-react";
import { MollyButton } from "@/components/ui/molly";
import { GAIT_ACTIONS, POSTURE_ACTIONS } from "@/constants/robot-actions";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useRobotStore } from "@/stores/use-robot-store";

/**
 * Lite3 driver commands (/<robot>/stand_up, sit_down, gait_*). The robot
 * refuses them while it walks a path or the e-stop holds it; the answer
 * shows as a toast.
 */
export function RobotActions() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const lite3 = useRobotStore((s) => s.lite3);

  const button = (command: string, label: string) => (
    <MollyButton
      key={command}
      variant="secondary"
      size="sm"
      disabled={busy !== null}
      onClick={() =>
        run(command, label, () => api.robotCommand(command), {
          successToast: true,
        })
      }
    >
      {busy === command && <Loader2 size={12} className="animate-spin" />}
      {label}
    </MollyButton>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="label">Posture</span>
        <span className="font-mono text-[10px] text-txt-tertiary">
          {lite3 ? lite3.basicState || "—" : "driver silent"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {POSTURE_ACTIONS.map((a) => button(a.command, a.label))}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="label">Gait</span>
        <span className="font-mono text-[10px] text-txt-tertiary">
          {lite3?.gait || "—"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {GAIT_ACTIONS.map((a) => button(a.command, a.label))}
      </div>
    </div>
  );
}
