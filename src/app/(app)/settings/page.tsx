"use client";

import { AppearanceSection } from "./_components/appearance-section";
import { AssistantSection } from "./_components/assistant-section";
import { ConnectionSection } from "./_components/connection-section";
import { InteractionSection } from "./_components/interaction-section";
import { MotionSection } from "./_components/motion-section";
import { VideoSection } from "./_components/video-section";

/** Connection and preferences, saved in this browser (the LLM is set on the server). */
export default function SettingsPage() {
  return (
    <div className="@container flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="grid grid-cols-1 gap-3 p-3 lg:gap-4 lg:p-4 @4xl:grid-cols-2">
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
