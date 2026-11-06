/**
 * The live context sent with a question: what a visitor could see for
 * themselves — where Molly is, what she is doing, the tour and its stops.
 * Pure: the caller passes store snapshots in.
 */

import { type Story, storySentence } from "@/lib/display/story";
import type {
  AssistantContext,
  AssistantTurn,
  ConversationEntry,
  POI,
  TourDefinition,
  TourState,
} from "@/types/ui";

export interface ContextInputs {
  demo: boolean;
  site: string;
  story: Story;
  battery: number | null;
  visitorsNearby: number;
  pois: ReadonlyArray<POI>;
  tours: ReadonlyArray<TourDefinition>;
  tour: {
    state: TourState;
    tourId: string;
    tourName: string;
    /** 0-based, -1 when idle */
    index: number;
    total: number;
    activePoiId: string | null;
    activePoiName: string;
  };
}

const MAX_PLACES = 40;

/** Stops of the running tour first, then every other POI of the site. */
function placesFor(i: ContextInputs): POI[] {
  const running = i.tours.find((t) => t.id === i.tour.tourId);
  const first = running
    ? running.poiIds
        .map((id) => i.pois.find((p) => p.id === id))
        .filter((p): p is POI => p !== undefined)
    : [];
  const rest = i.pois.filter((p) => !first.includes(p));
  return [...first, ...rest].slice(0, MAX_PLACES);
}

export function buildAssistantContext(i: ContextInputs): AssistantContext {
  const touring = i.tour.state === "RUNNING" || i.tour.state === "PAUSED";
  const running = i.tours.find((t) => t.id === i.tour.tourId);
  const stops = running?.poiIds ?? [];
  const nextId =
    touring && i.tour.index >= 0 ? stops[i.tour.index + 1] : undefined;
  const next = nextId ? (i.pois.find((p) => p.id === nextId)?.name ?? "") : "";

  return {
    mode: i.demo ? "demo" : "live",
    site: i.site,
    place: i.story.place,
    activity: storySentence(i.story),
    battery: i.battery,
    visitorsNearby: i.visitorsNearby,
    tour: touring
      ? {
          name: i.tour.tourName,
          state: i.tour.state === "PAUSED" ? "paused" : "running",
          stop: i.tour.activePoiName,
          index: Math.max(1, i.tour.index + 1),
          total: i.tour.total,
          next,
        }
      : null,
    places: placesFor(i).map((p) => ({
      name: p.name,
      description: p.description,
      narration: p.narration,
    })),
  };
}

/** Last few answered exchanges, oldest first, for follow-up questions. */
export function recentTurns(
  entries: ReadonlyArray<ConversationEntry>,
  count = 4,
  maxAgeMs = 15 * 60_000,
  now = Date.now(),
): AssistantTurn[] {
  return entries
    .filter((e) => !e.pending && e.ok && e.answer && now - e.at < maxAgeMs)
    .slice(-count)
    .map((e) => ({ question: e.question, answer: e.answer }));
}
