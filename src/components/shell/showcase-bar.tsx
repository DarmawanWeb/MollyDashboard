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
import { MollyMark } from "./molly-mark";
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
        <span className="flex items-center gap-2 @3xl:hidden">
          <MollyMark className="size-7" />
          <span className="text-base font-semibold tracking-tight">
            {BRAND.robot}
          </span>
        </span>
      </div>

      {/* the sidebar carries the name on desktop (globals.css) */}
      <div className="showcase-brand hidden items-center gap-2.5 @3xl:flex">
        <MollyMark className="size-8" />
        <div className="leading-tight">
          <div className="text-[1.05rem] font-semibold tracking-tight">
            {BRAND.robot}
          </div>
          <div className="text-[0.7rem] text-txt-tertiary">{copy.tagline}</div>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 @3xl:col-start-3">
        <StatusPill
          mode={mode}
          copy={copy}
          className="hidden @xl:inline-flex"
        />
        <LiveClock
          language={language}
          className="hidden whitespace-nowrap px-2 @[78rem]:flex"
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
