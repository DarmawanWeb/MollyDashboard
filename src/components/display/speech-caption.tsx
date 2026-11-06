import type { DisplayCopy } from "@/lib/display/copy";
import { cn } from "@/lib/utils";

function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-5 items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-bottom rounded-full bg-on-brand",
            active ? "h-full animate-eq" : "h-1.5",
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Live caption bar: what Molly is saying (see useCaption). */
export function SpeechCaption({
  text,
  speaking,
  copy,
}: {
  text: string;
  speaking: boolean;
  copy: DisplayCopy;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex animate-rise-in items-start gap-3 rounded-2xl px-4 py-3 shadow-card-lg",
        "bg-gradient-brand text-on-brand transition-opacity duration-500",
        !speaking && "opacity-80",
      )}
    >
      <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
        <Equalizer active={speaking} />
      </div>
      <div className="min-w-0">
        <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] opacity-80">
          {copy.speaking}
        </div>
        <p className="line-clamp-3 text-[1.05rem] font-semibold leading-snug">
          “{text}”
        </p>
      </div>
    </div>
  );
}
