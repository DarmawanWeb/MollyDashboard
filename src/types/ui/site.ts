/**
 * Site and mapping session snapshots (site/status, mapping/status).
 */

export interface SiteSnapshot {
  /** Active site, empty when none is loaded */
  site: string;
  sites: string[];
  hasMap: boolean;
  mapping: boolean;
  poiCount: number;
  tourCount: number;
  tagCount: number;
  message: string;
}

export interface MappingSnapshot {
  active: boolean;
  site: string;
  scans: number;
  /** m per cell */
  resolution: number;
  width: number;
  height: number;
  knownAreaM2: number;
  message: string;
}
