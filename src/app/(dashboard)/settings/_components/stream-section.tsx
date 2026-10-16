"use client";

import { Save, Video } from "lucide-react";
import { MollyButton, MollyField, MollySelect } from "@/components/ui/molly";
import { useSettingsStore } from "@/stores/use-settings-store";
import {
  STREAM_FPS_OPTIONS,
  STREAM_RESOLUTION_OPTIONS,
} from "../_data/options";
import { SettingsSection } from "./settings-section";

export function StreamSection() {
  const { resolution, fps } = useSettingsStore((s) => s.stream);
  const setStream = useSettingsStore((s) => s.setStream);

  return (
    <SettingsSection
      icon={<Video size={18} />}
      title="Stream Quality"
      iconColor="text-green"
    >
      <div className="flex flex-col gap-3">
        <MollyField label="Resolution" htmlFor="stream-res">
          <MollySelect
            id="stream-res"
            value={resolution}
            onChange={(v) => setStream({ resolution: v })}
            options={STREAM_RESOLUTION_OPTIONS}
          />
        </MollyField>

        <MollyField label="FPS" htmlFor="stream-fps">
          <MollySelect
            id="stream-fps"
            value={String(fps)}
            onChange={(v) => setStream({ fps: Number(v) })}
            options={STREAM_FPS_OPTIONS}
          />
        </MollyField>

        <MollyButton className="self-start">
          <Save size={13} /> Apply
        </MollyButton>
      </div>
    </SettingsSection>
  );
}
