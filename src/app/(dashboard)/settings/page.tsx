"use client";

import { ConnectionSection } from "./_components/connection-section";
import { LlmSection } from "./_components/llm-section";
import { MotionSection } from "./_components/motion-section";
import { Nav2Section } from "./_components/nav2-section";
import { StreamSection } from "./_components/stream-section";
import { TeleopSection } from "./_components/teleop-section";

export default function SettingsPage() {
  return (
    <div className="w-full overflow-y-auto p-6">
      <header className="mb-6">
        <h2 className="text-lg font-bold mb-0.5">Settings</h2>
        <p className="text-[13px] text-txt-tertiary">
          System parameters, connections, and teleop controls.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeleopSection />
        <ConnectionSection />
        <StreamSection />
        <Nav2Section />
        <LlmSection />
        <MotionSection />
      </div>
    </div>
  );
}
