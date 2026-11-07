"use client";

import { Footprints, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  MollyButton,
  MollyField,
  MollyNumberInput,
} from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useRobotStore } from "@/stores/use-robot-store";
import { SettingsSection } from "./settings-section";

/** Indoor range with visitors around; the follower clamps on its side too. */
const SPEED = { min: 0.1, max: 0.8, step: 0.05 };

/**
 * How fast the robot walks on tours and walk-tos: the path follower's
 * walking speed (a ROS parameter on the robot, /path_follower_node
 * target_linear_velocity).
 */
export function MotionSection() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const epoch = useRobotStore((s) => s.rosEpoch);

  const [robotSpeed, setRobotSpeed] = useState<number | null>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setRobotSpeed(await api.getWalkingSpeed());
    setDraft(null);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    void epoch; // reload from a rebuilt connection
    void load();
  }, [load, epoch]);

  const speed = draft ?? robotSpeed ?? 0.35;
  const dirty = draft !== null && draft !== robotSpeed;

  const apply = async () => {
    const res = await run(
      "speed",
      "Walking speed",
      () => api.setWalkingSpeed(speed),
      { successToast: true },
    );
    if (res?.success) await load();
  };

  return (
    <SettingsSection icon={<Footprints size={18} />} title="Motion">
      <div className="flex flex-col gap-3">
        <MollyField
          label="Walking speed"
          htmlFor="walking-speed"
          hint={
            loading
              ? "Reading the path follower…"
              : robotSpeed === null
                ? "Path follower not reachable"
                : `Robot: ${robotSpeed.toFixed(2)} m/s · tours and walks`
          }
        >
          <div className="flex gap-2">
            <MollyNumberInput
              id="walking-speed"
              value={speed}
              onChange={setDraft}
              min={SPEED.min}
              max={SPEED.max}
              step={SPEED.step}
              precision={2}
              disabled={robotSpeed === null}
              title="Walking speed in m/s"
              className="flex-1"
            />
            <MollyButton
              onClick={apply}
              disabled={!dirty || busy !== null}
              title="Set target_linear_velocity on /path_follower_node"
            >
              <Save size={13} />
              Apply
            </MollyButton>
            <MollyButton
              variant="ghost"
              onClick={() => void load()}
              disabled={loading}
              aria-label="Read the walking speed again"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </MollyButton>
          </div>
        </MollyField>
      </div>
    </SettingsSection>
  );
}
