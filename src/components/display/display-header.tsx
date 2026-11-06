"use client";

import { PartnerLockup } from "@/components/brand/partner-lockup";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BRAND } from "@/constants/brand";
import type { DisplayMode } from "@/hooks/use-display-mode";
import { useTheme } from "@/hooks/use-theme";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";
import type { BrandLogos } from "@/types";
import { LanguageToggle, LiveClock, StatusPill } from "./header-widgets";

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}

/** Partner logos, Molly's name, status, clock and the two toggles. */
export function DisplayHeader({
  logos,
  mode,
  copy,
  language,
  onLanguage,
}: {
  logos: BrandLogos;
  mode: DisplayMode;
  copy: DisplayCopy;
  language: DisplayLanguage;
  onLanguage: (language: DisplayLanguage) => void;
}) {
  const { resolved } = useTheme();

  return (
    <header className="grid shrink-0 grid-cols-1 items-center gap-4 px-4 pt-4 pb-3 md:grid-cols-[1fr_auto_1fr] lg:px-6">
      <PartnerLockup
        logos={logos}
        size="lg"
        className="justify-center md:justify-start"
      />

      <div className="flex flex-col items-center text-center leading-none">
        {/* a double click on the name toggles full screen (kiosk setup) */}
        <h1
          className="text-gradient-brand cursor-default select-none font-extrabold text-[2.1rem] tracking-tight"
          onDoubleClick={toggleFullscreen}
        >
          {BRAND.robot}
        </h1>
        <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-txt-tertiary">
          {copy.tagline}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 md:justify-end">
        <StatusPill mode={mode} copy={copy} />
        <LiveClock language={language} />
        <LanguageToggle
          language={language}
          onChange={onLanguage}
          label={copy.language}
        />
        <ThemeToggle
          className="size-10"
          label={resolved === "dark" ? copy.theme.light : copy.theme.dark}
        />
      </div>
    </header>
  );
}
