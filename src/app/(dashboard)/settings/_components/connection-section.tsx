"use client";

import { Radio, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/feedback";
import { MollyButton, MollyField, MollyInput } from "@/components/ui/molly";
import { env } from "@/lib/env";
import { isValidNamespace, normalizeNamespace } from "@/lib/ros";
import { useSettingsStore } from "@/stores/use-settings-store";
import { SettingsSection } from "./settings-section";

const isWs = (url: string) => url === "" || /^wss?:\/\/.+/.test(url);
const isHttp = (url: string) => url === "" || /^https?:\/\/.+/.test(url);

/**
 * Where the robot is: rosbridge (Molly robot.launch.py web:=true), the
 * camera server and the robot driver namespace. Empty URLs use the build's
 * NEXT_PUBLIC_* defaults.
 */
export function ConnectionSection() {
  const connection = useSettingsStore((s) => s.connection);
  const setConnection = useSettingsStore((s) => s.setConnection);

  // Local draft so the user can edit without immediately tearing down the
  // websocket connection. Commit on "Save & reconnect".
  const [draftRos, setDraftRos] = useState(connection.rosbridgeUrl);
  const [draftVideo, setDraftVideo] = useState(connection.videoServerUrl);
  const [draftNs, setDraftNs] = useState(connection.robotNamespace);

  const nsValid = isValidNamespace(draftNs);
  const valid = isWs(draftRos.trim()) && isHttp(draftVideo.trim()) && nsValid;
  const isDirty =
    draftRos !== connection.rosbridgeUrl ||
    draftVideo !== connection.videoServerUrl ||
    draftNs !== connection.robotNamespace;

  const handleSave = () => {
    const robotNamespace = normalizeNamespace(draftNs);
    setConnection({
      rosbridgeUrl: draftRos.trim(),
      videoServerUrl: draftVideo.trim(),
      robotNamespace,
    });
    setDraftNs(robotNamespace);
    // ConnectionProvider rebuilds the client with the new settings
    toast.info("Reconnecting…", draftRos.trim() || env.ROSBRIDGE_URL);
  };

  return (
    <SettingsSection icon={<Radio size={18} />} title="Connection">
      <div className="flex flex-col gap-3">
        <MollyField
          label="Rosbridge WebSocket URL"
          htmlFor="rosbridge-url"
          hint={`Empty: ${env.ROSBRIDGE_URL}`}
          error={
            isWs(draftRos.trim())
              ? undefined
              : "Must start with ws:// or wss://"
          }
        >
          <MollyInput
            id="rosbridge-url"
            value={draftRos}
            onChange={(e) => setDraftRos(e.target.value)}
            placeholder={env.ROSBRIDGE_URL}
            invalid={!isWs(draftRos.trim())}
          />
        </MollyField>

        <MollyField
          label="Web Video Server URL"
          htmlFor="video-url"
          hint={`Empty: ${env.VIDEO_SERVER_URL}`}
          error={
            isHttp(draftVideo.trim())
              ? undefined
              : "Must start with http:// or https://"
          }
        >
          <MollyInput
            id="video-url"
            value={draftVideo}
            onChange={(e) => setDraftVideo(e.target.value)}
            placeholder={env.VIDEO_SERVER_URL}
            invalid={!isHttp(draftVideo.trim())}
          />
        </MollyField>

        <MollyField
          label="Robot namespace"
          htmlFor="robot-ns"
          hint="Driver topics and services, e.g. /robot/battery"
          error={nsValid ? undefined : "Not a valid ROS namespace"}
        >
          <MollyInput
            id="robot-ns"
            value={draftNs}
            onChange={(e) => setDraftNs(e.target.value)}
            placeholder="robot"
            invalid={!nsValid}
          />
        </MollyField>

        <MollyButton
          onClick={handleSave}
          disabled={!isDirty || !valid}
          className="self-start"
        >
          <Save size={13} />
          {"Save & reconnect"}
        </MollyButton>
      </div>
    </SettingsSection>
  );
}
