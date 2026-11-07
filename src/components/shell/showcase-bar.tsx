"use client";

import { PartnerLockup } from "@/components/brand/partner-lockup";
import {
  LanguageToggle,
  LiveClock,
  StatusPill,
} from "@/components/display/header-widgets";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BRAND } from "@/constants/brand";
import { useDisplayMode } from "@/hooks/use-display-mode";
import { useTheme } from "@/hooks/use-theme";
import { DISPLAY_COPY } from "@/lib/display/copy";
import { useDisplayStore } from "@/stores/use-display-store";
import type { BrandLogos } from "@/types";
import { ExitPresentationButton, PresentButton } from "./presentation-controls";

/**
 * Top bar of the visitor display: the partners' logos, Molly's name,
 * status, clock, language, presentation mode and theme.
 */
export function ShowcaseBar({ logos }: { logos: BrandLogos }) {
  const mode = useDisplayMode();
  const language = useDisplayStore((s) => s.language);
  const setLanguage = useDisplayStore((s) => s.setLanguage);
  const copy = DISPLAY_COPY[language];
  const { resolved } = useTheme();

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 @3xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center">
        <PartnerLockup logos={logos} size="md" className="hidden @3xl:flex" />
        <span className="text-gradient-brand text-xl font-extrabold tracking-tight @3xl:hidden">
          {BRAND.robot}
        </span>
      </div>

      <div className="hidden flex-col items-center leading-none @3xl:flex">
        <span className="text-gradient-brand text-[1.7rem] font-extrabold tracking-tight">
          {BRAND.robot}
        </span>
        <span className="mt-0.5 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-txt-tertiary">
          {copy.tagline}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 @2xl:gap-3">
        <span className="hidden @xl:inline-flex">
          <StatusPill mode={mode} copy={copy} />
        </span>
        <LiveClock
          language={language}
          className="hidden whitespace-nowrap @[78rem]:flex"
        />
        <LanguageToggle
          language={language}
          onChange={setLanguage}
          label={copy.language}
        />
        <PresentButton copy={copy} />
        <ExitPresentationButton copy={copy} />
        <ThemeToggle
          className="presenting:hidden"
          label={resolved === "dark" ? copy.theme.light : copy.theme.dark}
        />
      </div>
    </div>
  );
}
