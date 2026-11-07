import type { DisplayCopy } from "@/lib/display/copy";
import { cn } from "@/lib/utils";

function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-bottom rounded-full bg-current",
            active ? "h-full animate-eq" : "h-1",
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Live caption: what Molly is saying (see useCaption). */
export function SpeechCaption({
  text,
  speaking,
  onVideo,
  copy,
}: {
  text: string;
  speaking: boolean;
  /** Over the live video: dark glass instead of a card */
  onVideo: boolean;
  copy: DisplayCopy;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex animate-rise-in items-start gap-3 rounded-xl px-4 py-3 transition-opacity duration-500",
        onVideo
          ? "bg-black/60 text-white backdrop-blur-md"
          : "border border-border-subtle bg-mol-secondary text-txt-primary shadow-card-lg",
        !speaking && "opacity-80",
      )}
    >
      <span
        className={cn("mt-1 shrink-0", onVideo ? "text-white" : "text-brand")}
      >
        <Equalizer active={speaking} />
      </span>
      <div className="min-w-0">
        <div
          className={cn(
            "text-xs font-medium",
            onVideo ? "text-white/70" : "text-txt-tertiary",
          )}
        >
          {copy.speaking}
        </div>
        <p className="line-clamp-3 text-[1.05rem] font-medium leading-snug">
          “{text}”
        </p>
      </div>
    </div>
  );
}
