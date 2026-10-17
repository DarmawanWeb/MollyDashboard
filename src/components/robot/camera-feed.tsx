"use client";

import { Camera, RotateCcw, VideoOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MollyButton } from "@/components/ui/molly";
import { useMockMode } from "@/hooks/use-mock-mode";
import { CAMERA_TOPIC, useVideoUrl } from "@/hooks/use-video-url";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

interface Props {
  label?: string;
  topic?: string;
  className?: string;
}

/**
 * Robot camera as MJPEG from web_video_server (started by the Molly
 * bringup with web:=true). Offline or on a failed stream it shows a
 * placeholder with a retry.
 */
export function CameraFeed({
  label = "RGB",
  topic = CAMERA_TOPIC,
  className,
}: Props) {
  const mock = useMockMode();
  const url = useVideoUrl(topic);
  const width = useSettingsStore((s) => s.video.width);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const failed = failedUrl === url;
  const live = !mock && !failed;
  const src = `${url}&_=${attempt}`;

  return (
    <div
      className={cn(
        "relative w-full h-35 overflow-hidden border-border-subtle border bg-mol-root",
        className,
      )}
    >
      {live ? (
        <Image
          key={src}
          src={src}
          alt={`${label} camera`}
          fill
          className="object-contain h-full w-full"
          unoptimized
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <>
          <div className="absolute inset-0 opacity-[0.03] bg-repeat-y animate-scan-line bg-[repeating-linear-gradient(0deg,#fff_0px,transparent_1px,transparent_3px)]" />
          <div className="flex flex-col items-center justify-center w-full h-full text-center gap-1">
            {failed ? (
              <VideoOff size={20} className="text-txt-muted" />
            ) : (
              <Camera size={20} className="text-txt-muted" />
            )}
            <div className="font-mono text-[11px] text-txt-muted">{topic}</div>
            <div className="text-[10px] text-border">
              {mock ? "offline — no video" : "web_video_server not reachable"}
            </div>
            {failed && (
              <MollyButton
                variant="ghost"
                size="xs"
                onClick={() => {
                  setFailedUrl(null);
                  setAttempt((n) => n + 1);
                }}
              >
                <RotateCcw size={10} /> Retry
              </MollyButton>
            )}
          </div>
        </>
      )}
      <div className="absolute top-2 left-2 font-mono text-[10px] text-txt-muted/70">
        {label} · MJPEG · {width}px
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            live ? "bg-green-500" : "bg-txt-muted",
          )}
        />
        <span
          className={cn(
            "font-mono text-[10px]",
            live ? "text-green-500" : "text-txt-muted",
          )}
        >
          {live ? "LIVE" : "OFF"}
        </span>
      </div>
    </div>
  );
}
