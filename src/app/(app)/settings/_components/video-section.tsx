"use client";

import { Video } from "lucide-react";
import { MollyField, MollySelect } from "@/components/ui/molly";
import { useSettingsStore } from "@/stores/use-settings-store";
import { SettingsSection } from "./settings-section";

const WIDTH_OPTIONS = [
  { value: "480", label: "480 px" },
  { value: "640", label: "640 px" },
  { value: "960", label: "960 px" },
  { value: "1280", label: "1280 px" },
];

const QUALITY_OPTIONS = [
  { value: "30", label: "30 — weak Wi-Fi" },
  { value: "45", label: "45" },
  { value: "60", label: "60 — default" },
  { value: "80", label: "80 — sharp" },
];

/**
 * Camera stream options sent to web_video_server with every request.
 */
export function VideoSection() {
  const { quality, width } = useSettingsStore((s) => s.video);
  const setVideo = useSettingsStore((s) => s.setVideo);

  return (
    <SettingsSection
      icon={<Video size={18} />}
      title="Camera Stream"
      iconColor="text-green"
    >
      <div className="flex flex-col gap-3">
        <MollyField label="Width" htmlFor="video-width">
          <MollySelect
            id="video-width"
            value={String(width)}
            onChange={(v) => setVideo({ width: Number(v) })}
            options={WIDTH_OPTIONS}
          />
        </MollyField>

        <MollyField
          label="JPEG quality"
          htmlFor="video-quality"
          hint="MJPEG over the robot's Wi-Fi: lower is lighter"
        >
          <MollySelect
            id="video-quality"
            value={String(quality)}
            onChange={(v) => setVideo({ quality: Number(v) })}
            options={QUALITY_OPTIONS}
          />
        </MollyField>
      </div>
    </SettingsSection>
  );
}
