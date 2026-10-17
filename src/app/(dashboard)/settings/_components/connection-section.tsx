"use client";

import { Radio, Save } from "lucide-react";
import { toast } from "@/components/feedback";
import { MollyButton, MollyField, MollyInput } from "@/components/ui/molly";
import { useDraft } from "@/hooks/use-draft";
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

  // Drafts so the operator can edit without tearing down the websocket on
  // every keystroke. Committed on "Save & reconnect".
  const ros = useDraft(connection.rosbridgeUrl);
  const video = useDraft(connection.videoServerUrl);
  const ns = useDraft(connection.robotNamespace);

  const nsValid = isValidNamespace(ns.value);
  const valid = isWs(ros.value.trim()) && isHttp(video.value.trim()) && nsValid;
  const isDirty = ros.dirty || video.dirty || ns.dirty;

  const handleSave = () => {
    const rosbridgeUrl = ros.value.trim();
    setConnection({
      rosbridgeUrl,
      videoServerUrl: video.value.trim(),
      robotNamespace: normalizeNamespace(ns.value),
    });
    ros.reset();
    video.reset();
    ns.reset();
    // ConnectionProvider rebuilds the client with the new settings
    toast.info("Reconnecting…", rosbridgeUrl || env.ROSBRIDGE_URL);
  };

  return (
    <SettingsSection icon={<Radio size={18} />} title="Connection">
      <div className="flex flex-col gap-3">
        <MollyField
          label="Rosbridge WebSocket URL"
          htmlFor="rosbridge-url"
          hint={`Empty: ${env.ROSBRIDGE_URL}`}
          error={
            isWs(ros.value.trim())
              ? undefined
              : "Must start with ws:// or wss://"
          }
        >
          <MollyInput
            id="rosbridge-url"
            value={ros.value}
            onChange={(e) => ros.set(e.target.value)}
            placeholder={env.ROSBRIDGE_URL}
            invalid={!isWs(ros.value.trim())}
          />
        </MollyField>

        <MollyField
          label="Web Video Server URL"
          htmlFor="video-url"
          hint={`Empty: ${env.VIDEO_SERVER_URL}`}
          error={
            isHttp(video.value.trim())
              ? undefined
              : "Must start with http:// or https://"
          }
        >
          <MollyInput
            id="video-url"
            value={video.value}
            onChange={(e) => video.set(e.target.value)}
            placeholder={env.VIDEO_SERVER_URL}
            invalid={!isHttp(video.value.trim())}
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
            value={ns.value}
            onChange={(e) => ns.set(e.target.value)}
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
