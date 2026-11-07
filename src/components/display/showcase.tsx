"use client";

import { PartnerLockup } from "@/components/brand/partner-lockup";
import { ErrorBoundary } from "@/components/error";
import { useDisplayMode } from "@/hooks/use-display-mode";
import { useRobotStory } from "@/hooks/use-robot-story";
import { DISPLAY_COPY } from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { useDisplayStore } from "@/stores/use-display-store";
import type { BrandLogos } from "@/types";
import { ChatPanel } from "./chat/chat-panel";
import { DemoAutopilot } from "./demo-autopilot";
import { HeroCamera } from "./hero-camera";
import { LocationMap } from "./location-map";
import { StatTiles } from "./stat-tiles";
import { TourJourney } from "./tour-journey";

const RESTING: Story = { kind: "offline", place: "", target: "" };

/**
 * The visitor display for the experience center: what Molly sees and says,
 * where she is, the tour, today's numbers, and a chat to ask her anything.
 * Laid out by the width it gets (container queries), so it fits next to the
 * sidebar, full screen on a TV in presentation mode, and on a phone:
 *   narrow  one column
 *   @3xl    two columns, scrolls
 *   @7xl    three columns that fill the screen (camera, map, chat)
 */
export function Showcase({ logos }: { logos: BrandLogos }) {
  const mode = useDisplayMode();
  const robotStory = useRobotStory();
  const story = mode === "offline" ? RESTING : robotStory;
  const language = useDisplayStore((s) => s.language);
  const copy = DISPLAY_COPY[language];

  return (
    <div
      data-surface="display"
      lang={language}
      className="@container flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      {/* the top bar has no room for the logos on narrow screens */}
      <div className="flex justify-center px-4 pt-4 @3xl:hidden">
        <PartnerLockup logos={logos} size="sm" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 @3xl:grid-cols-2 @3xl:p-5 @7xl:min-h-[42rem] @7xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(21rem,26rem)] @7xl:grid-rows-[auto_minmax(0,1fr)_auto] @7xl:p-6">
        <StatTiles
          mode={mode}
          copy={copy}
          className="@3xl:col-span-2 @7xl:col-start-1 @7xl:row-start-1"
        />
        <ErrorBoundary>
          <HeroCamera
            mode={mode}
            story={story}
            copy={copy}
            className="aspect-[4/3] @md:aspect-video @7xl:col-start-1 @7xl:row-start-2 @7xl:aspect-auto"
          />
        </ErrorBoundary>
        <LocationMap
          mode={mode}
          story={story}
          copy={copy}
          className="min-h-[20rem] @7xl:col-start-2 @7xl:row-start-2 @7xl:min-h-0"
        />
        <TourJourney
          mode={mode}
          story={story}
          copy={copy}
          className="@3xl:col-span-2 @7xl:col-start-1 @7xl:row-start-3"
        />
        <ChatPanel
          copy={copy}
          language={language}
          className="h-[36rem] @3xl:col-span-2 @7xl:col-span-1 @7xl:col-start-3 @7xl:row-span-3 @7xl:row-start-1 @7xl:h-auto"
        />
      </div>

      {mode === "demo" && <DemoAutopilot />}
    </div>
  );
}
