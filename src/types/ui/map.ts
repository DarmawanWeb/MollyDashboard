/**
 * Saved map metadata from operator's library.
 *
 * Renamed from `MapMeta` to avoid clash with ROS `nav_msgs/MapMetaData`.
 */
export interface SavedMap {
  id: string;
  name: string;
  /** Filename on robot side (e.g. "lobby.yaml") */
  file: string;
  /** ISO 8601 or display-friendly date string */
  date: string;
  /** Human-readable size (e.g. "1.2 MB") */
  size: string;
  poi_count: number;
  active: boolean;
}
