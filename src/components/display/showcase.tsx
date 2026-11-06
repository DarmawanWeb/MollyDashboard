"use client";

import { ErrorBoundary } from "@/components/error";
import { useDisplayMode } from "@/hooks/use-display-mode";
import { useIdleCursor } from "@/hooks/use-idle-cursor";
import { useRobotStory } from "@/hooks/use-robot-story";
import { DISPLAY_COPY } from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { cn } from "@/lib/utils";
import { useDisplayStore } from "@/stores/use-display-store";
import type { BrandLogos } from "@/types";
import { ChatPanel } from "./chat/chat-panel";
import { DailyStatsTracker } from "./daily-stats-tracker";
import { DemoAutopilot } from "./demo-autopilot";
import { DisplayFooter } from "./display-footer";
import { DisplayHeader } from "./display-header";
import { HeroCamera } from "./hero-camera";
import { LocationMap } from "./location-map";
import { StatTiles } from "./stat-tiles";
import { TourJourney } from "./tour-journey";

const RESTING: Story = { kind: "offline", place: "", target: "" };

/**
 * The visitor display for the experience center: what Molly sees and says,
 * where she is, the tour, today's numbers, and a chat to ask her anything.
 * Full-screen on a TV (xl and up), stacked on tablets and phones. Nothing
 * technical: the operator pages have that.
 */
export function Showcase({ logos }: { logos: BrandLogos }) {
  const mode = useDisplayMode();
  const robotStory = useRobotStory();
  const story = mode === "offline" ? RESTING : robotStory;
  const language = useDisplayStore((s) => s.language);
  const setLanguage = useDisplayStore((s) => s.setLanguage);
  const copy = DISPLAY_COPY[language];
  const cursorIdle = useIdleCursor();

  return (
    <div
      data-surface="display"
      lang={language}
      className={cn(
        "display-backdrop flex min-h-dvh flex-col text-txt-primary xl:h-dvh xl:overflow-hidden",
        cursorIdle && "cursor-none",
      )}
    >
      <DisplayHeader
        logos={logos}
        mode={mode}
        copy={copy}
        language={language}
        onLanguage={setLanguage}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-3 md:grid-cols-2 lg:px-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(22rem,27rem)] xl:grid-rows-[auto_minmax(0,1fr)_auto]">
        <StatTiles
          mode={mode}
          copy={copy}
          className="md:col-span-2 xl:col-start-1 xl:row-start-1"
        />
        <ErrorBoundary>
          <HeroCamera
            mode={mode}
            story={story}
            copy={copy}
            className="h-[19rem] sm:h-auto sm:aspect-video md:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-2 xl:aspect-auto xl:h-auto"
          />
        </ErrorBoundary>
        <LocationMap
          mode={mode}
          story={story}
          copy={copy}
          className="min-h-[20rem] xl:col-start-2 xl:row-start-2 xl:min-h-0"
        />
        <TourJourney
          mode={mode}
          story={story}
          copy={copy}
          className="md:col-span-2 xl:col-span-2 xl:col-start-1 xl:row-start-3"
        />
        <ChatPanel
          copy={copy}
          language={language}
          className="h-[36rem] md:col-span-2 md:h-[40rem] xl:col-span-1 xl:col-start-3 xl:row-span-3 xl:row-start-1 xl:h-auto"
        />
      </main>

      <DisplayFooter copy={copy} language={language} />
      <DailyStatsTracker mode={mode} />
      {mode === "demo" && <DemoAutopilot />}
    </div>
  );
}
