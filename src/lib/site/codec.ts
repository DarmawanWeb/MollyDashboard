/**
 * Site, POI, tour and mapping conversions between the wire
 * (molly_interfaces) and the dashboard's UI shapes.
 */

import type {
  MappingStatusWire,
  PoiWire,
  SiteStatusWire,
  TourWire,
} from "@/types/ros/molly";
import type {
  Language,
  MappingSnapshot,
  POI,
  SiteSnapshot,
  TourDefinition,
} from "@/types/ui";

/** Site names and POI / tour ids accepted by the robot. */
export const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;

export function isValidId(value: string): boolean {
  return ID_PATTERN.test(value);
}

/** Turn free text into a valid site name / id: "Lobby East" → "lobby-east". */
export function toId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
}

const LANGUAGES: ReadonlyArray<Language> = ["", "id", "en"];

export function parseLanguage(raw: string): Language {
  return (LANGUAGES as readonly string[]).includes(raw)
    ? (raw as Language)
    : "";
}

/* ----------------------------------------------------------------------------
 * POIs
 * ------------------------------------------------------------------------- */

export function decodePoi(w: PoiWire): POI {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    x: w.x,
    y: w.y,
    yaw: w.yaw,
    narration: w.narration,
    language: parseLanguage(w.language),
    gesture: w.gesture,
    dwellSec: w.dwell_sec,
  };
}

export function encodePoi(p: POI): PoiWire {
  return {
    id: p.id,
    name: p.name.trim(),
    description: p.description.trim(),
    x: p.x,
    y: p.y,
    yaw: p.yaw,
    narration: p.narration.trim(),
    language: p.language,
    gesture: p.gesture,
    dwell_sec: Math.max(0, p.dwellSec),
  };
}

/* ----------------------------------------------------------------------------
 * Tours
 * ------------------------------------------------------------------------- */

export function decodeTour(w: TourWire): TourDefinition {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    poiIds: [...w.poi_ids],
    returnPoiId: w.return_poi_id,
  };
}

export function encodeTour(t: TourDefinition): TourWire {
  return {
    id: t.id,
    name: t.name.trim(),
    description: t.description.trim(),
    poi_ids: [...t.poiIds],
    return_poi_id: t.returnPoiId,
  };
}

/* ----------------------------------------------------------------------------
 * Site and mapping status
 * ------------------------------------------------------------------------- */

export const EMPTY_SITE: SiteSnapshot = {
  site: "",
  sites: [],
  hasMap: false,
  mapping: false,
  poiCount: 0,
  tourCount: 0,
  tagCount: 0,
  message: "",
};

export const EMPTY_MAPPING: MappingSnapshot = {
  active: false,
  site: "",
  scans: 0,
  resolution: 0,
  width: 0,
  height: 0,
  knownAreaM2: 0,
  message: "",
};

export function decodeSiteStatus(w: SiteStatusWire): SiteSnapshot {
  return {
    site: w.site,
    sites: [...w.sites].sort(),
    hasMap: w.has_map,
    mapping: w.mapping,
    poiCount: w.pois,
    tourCount: w.tours,
    tagCount: w.tags,
    message: w.message,
  };
}

export function decodeMappingStatus(w: MappingStatusWire): MappingSnapshot {
  return {
    active: w.active,
    site: w.site,
    scans: w.scans,
    resolution: w.resolution,
    width: w.width,
    height: w.height,
    knownAreaM2: w.known_area_m2,
    message: w.message,
  };
}
