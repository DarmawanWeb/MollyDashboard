"use client";

import { env } from "@/lib/env";
import { useSettingsStore } from "@/stores/use-settings-store";

export const CAMERA_TOPIC = "/camera/camera/color/image_raw";

/**
 * web_video_server MJPEG URL of the robot camera with the configured
 * quality and width.
 */
export function useVideoUrl(topic: string = CAMERA_TOPIC): string {
  const base = useSettingsStore((s) => s.connection.videoServerUrl);
  const { quality, width } = useSettingsStore((s) => s.video);
  const root = (base || env.VIDEO_SERVER_URL).replace(/\/+$/, "");
  const params = new URLSearchParams({
    topic,
    type: "mjpeg",
    quality: String(quality),
    width: String(width),
  });
  return `${root}/stream?${params.toString()}`;
}
