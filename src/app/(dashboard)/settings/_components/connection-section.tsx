"use client";

import { Radio, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/feedback";
import { MollyButton, MollyField, MollyInput } from "@/components/ui/molly";
import { configureRos, getRos } from "@/lib/ros";
import { useSettingsStore } from "@/stores/use-settings-store";
import { SettingsSection } from "./settings-section";

export function ConnectionSection() {
  const { rosbridgeUrl, videoServerUrl } = useSettingsStore(
    (s) => s.connection,
  );
  const setConnection = useSettingsStore((s) => s.setConnection);

  // Local draft so the user can edit without immediately tearing down the
  // websocket connection. Commit on "Save & Reconnect".
  const [draftRos, setDraftRos] = useState(rosbridgeUrl);
  const [draftVideo, setDraftVideo] = useState(videoServerUrl);

  const isDirty = draftRos !== rosbridgeUrl || draftVideo !== videoServerUrl;

  const handleSave = () => {
    setConnection({
      rosbridgeUrl: draftRos,
      videoServerUrl: draftVideo,
    });
    // Tear down + rebuild the singleton with new URL
    configureRos({ url: draftRos });
    getRos().connect();
    toast.info("Reconnecting…", draftRos);
  };

  return (
    <SettingsSection icon={<Radio size={18} />} title="Connection">
      <div className="flex flex-col gap-3">
        <MollyField label="Rosbridge WebSocket URL" htmlFor="rosbridge-url">
          <MollyInput
            id="rosbridge-url"
            value={draftRos}
            onChange={(e) => setDraftRos(e.target.value)}
            placeholder="ws://192.168.1.120:9090"
          />
        </MollyField>

        <MollyField label="Web Video Server URL" htmlFor="video-url">
          <MollyInput
            id="video-url"
            value={draftVideo}
            onChange={(e) => setDraftVideo(e.target.value)}
            placeholder="http://192.168.1.120:8080"
          />
        </MollyField>

        <MollyButton
          onClick={handleSave}
          disabled={!isDirty}
          className="self-start"
        >
          <Save size={13} /> Save &amp; reconnect
        </MollyButton>
      </div>
    </SettingsSection>
  );
}
