"use client";

import { Palette } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-toggle";
import { SettingsSection } from "./settings-section";

/** Light, dark, or following the operating system; saved per browser. */
export function AppearanceSection() {
  return (
    <SettingsSection
      icon={<Palette size={18} />}
      title="Appearance"
      iconColor="text-amber"
    >
      <div className="flex flex-col gap-2">
        <span className="label">Theme</span>
        <ThemeSwitcher />
        <span className="text-[11px] text-txt-muted">
          Applies to the display and the operator pages in this browser. Other
          open tabs follow.
        </span>
      </div>
    </SettingsSection>
  );
}
