/**
 * UI-side connection and stream configuration types.
 */

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export type StreamFormat = "mjpeg" | "h264" | "vp8";

export interface StreamConfig {
  resolution: string;
  fps: number;
  quality: number;
  format: StreamFormat;
}
