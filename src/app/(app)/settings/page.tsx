"use client";

import { AppearanceSection } from "./_components/appearance-section";
import { AssistantSection } from "./_components/assistant-section";
import { ConnectionSection } from "./_components/connection-section";
import { InteractionSection } from "./_components/interaction-section";
import { MotionSection } from "./_components/motion-section";
import { VideoSection } from "./_components/video-section";

export default function SettingsPage() {
  return (
    <div className="w-full overflow-y-auto p-6">
      <header className="mb-6">
        <h2 className="mb-0.5 text-lg font-bold">Settings</h2>
        <p className="text-[13px] text-txt-tertiary">
          Connection to the robot and dashboard preferences, saved in this
          browser. The LLM is configured on the dashboard server.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConnectionSection />
        <AssistantSection />
        <VideoSection />
        <InteractionSection />
        <MotionSection />
        <AppearanceSection />
      </div>
    </div>
  );
}
