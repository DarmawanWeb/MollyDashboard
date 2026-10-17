"use client";

import { ConnectionSection } from "./_components/connection-section";
import { VideoSection } from "./_components/video-section";

export default function SettingsPage() {
  return (
    <div className="w-full overflow-y-auto p-6">
      <header className="mb-6">
        <h2 className="text-lg font-bold mb-0.5">Settings</h2>
        <p className="text-[13px] text-txt-tertiary">
          Connection to the robot and dashboard preferences, saved in this
          browser.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConnectionSection />
        <VideoSection />
      </div>
    </div>
  );
}
