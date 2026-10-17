import { create } from "zustand";

import type {
  MappingSnapshot,
  POI,
  SiteSnapshot,
  TourDefinition,
} from "@/types";

interface SiteStore {
  /** site/status: active site, site list, counts */
  status: SiteSnapshot;
  /** mapping/status: the mapping session */
  mapping: MappingSnapshot;
  /** site/pois, in the robot's list order */
  pois: POI[];
  /** site/tours */
  tours: TourDefinition[];

  setStatus: (status: SiteSnapshot) => void;
  setMapping: (mapping: MappingSnapshot) => void;
  setPois: (pois: POI[]) => void;
  setTours: (tours: TourDefinition[]) => void;
  reset: () => void;
}

/**
 * The active site as the robot reports it. The robot is the source of truth
 * for POIs and tours; the dashboard only edits them through services and
 * renders what comes back on the latched topics.
 */
const INITIAL = {
  status: {
    site: "",
    sites: [],
    hasMap: false,
    mapping: false,
    poiCount: 0,
    tourCount: 0,
    tagCount: 0,
    message: "",
  },
  mapping: {
    active: false,
    site: "",
    scans: 0,
    resolution: 0,
    width: 0,
    height: 0,
    knownAreaM2: 0,
    message: "",
  },
  pois: [] as POI[],
  tours: [] as TourDefinition[],
};

export const useSiteStore = create<SiteStore>((set) => ({
  ...INITIAL,

  setStatus: (status) => set({ status }),
  setMapping: (mapping) => set({ mapping }),
  setPois: (pois) => set({ pois }),
  setTours: (tours) => set({ tours }),
  reset: () => set(INITIAL),
}));
