export default function ResourceBar({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="label">{label}</span>
        <span className="text-xs font-mono text-txt-secondary">
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>

      <div className="h-2 bg-mol-root">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
