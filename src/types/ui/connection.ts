/**
 * UI-side connection and video stream configuration types.
 */

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

/** web_video_server MJPEG options */
export interface VideoStreamConfig {
  /** JPEG quality 1..100 */
  quality: number;
  /** Frame width in pixels (height follows the aspect ratio) */
  width: number;
}
