"use client";

import { Moon, RotateCcw, VideoOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCaption } from "@/hooks/use-caption";
import type { DisplayMode } from "@/hooks/use-display-mode";
import { useVideoUrl } from "@/hooks/use-video-url";
import {
  type DisplayCopy,
  type StoryTone,
  storyTone,
} from "@/lib/display/copy";
import type { Story } from "@/lib/display/story";
import { cn } from "@/lib/utils";
import { MollyIllustration } from "./molly-illustration";
import { SpeechCaption } from "./speech-caption";

const TONE: Record<StoryTone, string> = {
  go: "bg-green",
  talk: "bg-violet",
  wait: "bg-amber",
  alert: "bg-orange",
  rest: "bg-txt-muted",
};

function Placeholder({
  mode,
  failed,
  captioned,
  copy,
  onRetry,
}: {
  mode: DisplayMode;
  failed: boolean;
  /** A caption covers the bottom: keep the text out of its way */
  captioned: boolean;
  copy: DisplayCopy;
  onRetry: () => void;
}) {
  const offline = mode === "offline";
  const title = offline
    ? copy.camera.offlineTitle
    : failed
      ? copy.camera.failedTitle
      : copy.camera.demoTitle;
  const body = offline ? copy.camera.offlineBody : copy.camera.demoBody;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* soft brand light and rings */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 70%), radial-gradient(50% 50% at 80% 90%, color-mix(in oklab, var(--brand-2) 18%, transparent), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute aspect-square w-[38%] rounded-full border border-brand/30 animate-ping-soft"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--txt-primary) 1px, transparent 1px), linear-gradient(90deg, var(--txt-primary) 1px, transparent 1px)",
          backgroundSize: "2.5rem 2.5rem",
          maskImage:
            "radial-gradient(circle at center, black, transparent 75%)",
        }}
      />

      {/* sized by the card's height, so a short card never runs into the caption */}
      <div
        className={cn(
          "relative flex h-full flex-col items-center gap-3 px-6 pt-14 pb-6 text-center",
          captioned ? "justify-start" : "justify-center",
        )}
      >
        <div
          className={cn(
            "flex max-w-[min(80%,26rem)] shrink-0 items-center justify-center transition-[height] duration-500",
            captioned ? "h-[40%]" : "h-[46%]",
            offline && "opacity-60 grayscale",
          )}
        >
          <MollyIllustration className="h-full w-auto max-w-full" />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-lg font-bold",
            captioned && "hidden",
          )}
        >
          {offline && <Moon className="size-5 text-txt-tertiary" />}
          {failed && !offline && (
            <VideoOff className="size-5 text-txt-tertiary" />
          )}
          {title}
        </div>
        <p
          className={cn(
            "max-w-md text-sm text-txt-tertiary",
            captioned && "hidden",
          )}
        >
          {body}
        </p>
        {failed && !offline && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-mol-secondary px-3 py-1.5 text-xs font-semibold text-txt-secondary hover:text-txt-primary"
          >
            <RotateCcw className="size-3.5" />
            {copy.camera.retry}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The big picture: Molly's live camera (web_video_server MJPEG) with what
 * she is doing and live captions of what she says. Without video it shows
 * an illustration of Molly instead.
 */
export function HeroCamera({
  mode,
  story,
  copy,
  className,
}: {
  mode: DisplayMode;
  story: Story;
  copy: DisplayCopy;
  className?: string;
}) {
  const url = useVideoUrl();
  const caption = useCaption();
  // offline, the stores hold the operator pages' mock robot: say nothing
  const captionText = mode === "offline" ? null : caption.text;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const failed = failedUrl === url;
  const live = mode === "live" && !failed;
  const src = `${url}&_=${attempt}`;
  const chip = live
    ? "bg-black/45 text-white"
    : "border border-border-subtle bg-mol-secondary/85 text-txt-primary shadow-card";

  return (
    <section
      className={cn(
        "display-card relative isolate overflow-hidden bg-mol-tertiary",
        className,
      )}
      aria-label={copy.camera.title}
    >
      {live ? (
        <Image
          key={src}
          src={src}
          alt={copy.camera.title}
          fill
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <Placeholder
          mode={mode}
          failed={failed}
          captioned={captionText !== null}
          copy={copy}
          onRetry={() => {
            setFailedUrl(null);
            setAttempt((n) => n + 1);
          }}
        />
      )}

      {/* legibility gradients for the overlays on video */}
      {live && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent"
          />
        </>
      )}

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur",
            chip,
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              live
                ? "bg-red-500 animate-pulse-dot"
                : mode === "demo"
                  ? "bg-amber"
                  : "bg-txt-muted",
            )}
          />
          {live
            ? copy.camera.live
            : mode === "demo"
              ? copy.camera.demo
              : copy.status.offline}
          <span className="hidden font-medium opacity-75 @md:inline">
            · {copy.camera.title}
          </span>
        </span>

        <span
          className={cn(
            "inline-flex min-w-0 max-w-[65%] items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold backdrop-blur",
            chip,
          )}
        >
          <span className="relative flex size-2.5 shrink-0">
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 rounded-full animate-ping-soft",
                TONE[storyTone(story.kind)],
              )}
            />
            <span
              className={cn(
                "relative size-2.5 rounded-full",
                TONE[storyTone(story.kind)],
              )}
            />
          </span>
          <span className="truncate">{copy.story(story)}</span>
        </span>
      </div>

      {captionText && (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <SpeechCaption
            text={captionText}
            speaking={caption.speaking}
            copy={copy}
          />
        </div>
      )}
    </section>
  );
}
