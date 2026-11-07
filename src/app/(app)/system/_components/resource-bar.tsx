import { cn } from "@/lib/utils";

export default function ResourceBar({
  label,
  value,
  max,
  unit,
  barClassName,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  /** Background class of the filled part, e.g. "bg-cyan" */
  barClassName: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="label">{label}</span>
        <span className="text-xs tabular-nums text-txt-secondary">
          <span className="font-bold text-txt-primary">
            {value}
            {unit}
          </span>{" "}
          / {max}
          {unit}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-mol-tertiary">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            barClassName,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
