"use client";

import { Compass, Save } from "lucide-react";
import { toast } from "@/components/feedback";
import {
  MollyButton,
  MollyField,
  MollyNumberInput,
  MollySelect,
} from "@/components/ui/molly";
import { getRos, SERVICES } from "@/lib/ros";
import { useSettingsStore } from "@/stores/use-settings-store";
import {
  NAV2_CONTROLLER_OPTIONS,
  NAV2_PLANNER_OPTIONS,
} from "../_data/options";
import { SettingsSection } from "./settings-section";

export function Nav2Section() {
  const nav2 = useSettingsStore((s) => s.nav2);
  const setNav2 = useSettingsStore((s) => s.setNav2);

  const handleApply = () => {
    getRos()
      .callService(SERVICES.SET_NAV2_PARAMS, {
        max_vel_x: nav2.maxVelLin,
        max_vel_theta: nav2.maxVelAng,
        min_obstacle_dist: nav2.minObstacleDist,
        goal_tolerance: nav2.goalTolerance,
        planner: nav2.planner,
        controller: nav2.controller,
      })
      .then(() => {
        toast.success("Nav2 parameters applied");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[nav2] set params failed:", err);
        toast.error(
          "Failed to apply Nav2 params",
          err instanceof Error ? err.message : String(err),
        );
      });
  };

  return (
    <SettingsSection
      icon={<Compass size={18} />}
      title="Nav2 Parameters"
      iconColor="text-orange"
    >
      <div className="flex flex-col gap-2.5">
        <MollyField label="Max linear velocity (m/s)" htmlFor="nav-max-lin">
          <MollyNumberInput
            id="nav-max-lin"
            value={nav2.maxVelLin}
            onChange={(v) => setNav2({ maxVelLin: v })}
            min={0.05}
            max={2}
            step={0.05}
            precision={2}
          />
        </MollyField>

        <MollyField label="Max angular velocity (rad/s)" htmlFor="nav-max-ang">
          <MollyNumberInput
            id="nav-max-ang"
            value={nav2.maxVelAng}
            onChange={(v) => setNav2({ maxVelAng: v })}
            min={0.1}
            max={3}
            step={0.1}
            precision={1}
          />
        </MollyField>

        <MollyField label="Min obstacle distance (m)" htmlFor="nav-obs">
          <MollyNumberInput
            id="nav-obs"
            value={nav2.minObstacleDist}
            onChange={(v) => setNav2({ minObstacleDist: v })}
            min={0.05}
            max={2}
            step={0.05}
            precision={2}
          />
        </MollyField>

        <MollyField label="Goal tolerance (m)" htmlFor="nav-goal-tol">
          <MollyNumberInput
            id="nav-goal-tol"
            value={nav2.goalTolerance}
            onChange={(v) => setNav2({ goalTolerance: v })}
            min={0.01}
            max={1}
            step={0.01}
            precision={2}
          />
        </MollyField>

        <MollyField label="Planner" htmlFor="nav-planner">
          <MollySelect
            id="nav-planner"
            value={nav2.planner}
            onChange={(v) => setNav2({ planner: v })}
            options={NAV2_PLANNER_OPTIONS}
          />
        </MollyField>

        <MollyField label="Controller" htmlFor="nav-controller">
          <MollySelect
            id="nav-controller"
            value={nav2.controller}
            onChange={(v) => setNav2({ controller: v })}
            options={NAV2_CONTROLLER_OPTIONS}
          />
        </MollyField>

        <MollyButton onClick={handleApply} className="self-start mt-1">
          <Save size={13} /> Apply to Nav2
        </MollyButton>
      </div>
    </SettingsSection>
  );
}
