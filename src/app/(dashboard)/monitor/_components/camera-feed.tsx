"use client";

import { Camera } from "lucide-react";
import Image from "next/image";

interface Props {
  label?: string;
  topic?: string;
  streamUrl?: string;
}

export function CameraFeed({
  label = "RGB",
  topic = "/camera/color/image_raw",
  streamUrl,
}: Props) {
  return (
    <div className="relative w-full h-35 overflow-hidden border-border-subtle border">
      {streamUrl ? (
        <Image
          src={streamUrl}
          alt={label}
          fill
          className="object-contain h-full w-full"
          unoptimized
        />
      ) : (
        <>
          <div className="absolute inset-0 opacity-[0.03] bg-repeat-y animate-scan-line bg-[repeating-linear-gradient(0deg,#fff_0px,transparent_1px,transparent_3px)]" />
          <div className="flex flex-col items-center justify-center w-full h-full text-center">
            <Camera size={20} className="text-txt-muted" />
            <div className="font-mono text-[11px] text-txt-muted mt-1.5">
              {topic}
            </div>
            <div className="text-[10px] text-border mt-0.5">
              web_video_server :8080
            </div>
          </div>
        </>
      )}
      <div className="absolute top-2 left-2 font-mono text-[10px] text-txt-muted/50">
        {label} · 640×480 · 30fps
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />

        <span className="font-mono text-[10px] text-green-500">LIVE</span>
      </div>
    </div>
  );
}
