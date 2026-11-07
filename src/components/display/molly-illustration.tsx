import { cn } from "@/lib/utils";

const NEAR = "var(--txt-primary)";

function Leg({
  hip,
  knee,
  foot,
  far = false,
}: {
  hip: [number, number];
  knee: [number, number];
  foot: [number, number];
  far?: boolean;
}) {
  const opacity = far ? 0.32 : 0.85;
  return (
    <g opacity={opacity}>
      <polyline
        points={`${hip.join(",")} ${knee.join(",")} ${foot.join(",")}`}
        fill="none"
        stroke={NEAR}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={knee[0]}
        cy={knee[1]}
        r={7}
        fill="var(--mol-elevated)"
        stroke="var(--border-strong)"
        strokeWidth={2}
      />
      <ellipse cx={foot[0] + 3} cy={foot[1] + 2} rx={9} ry={5} fill={NEAR} />
    </g>
  );
}

/**
 * Molly as a friendly line drawing of a four-legged robot (an original
 * illustration, not a product photo): shown when there is no live camera.
 */
export function MollyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label="Molly"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="molly-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-2)" />
        </linearGradient>
        <radialGradient id="molly-eye-glow">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.8} />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse
        cx={164}
        cy={200}
        rx={112}
        ry={9}
        fill="var(--txt-primary)"
        opacity={0.1}
      />

      <g className="animate-float">
        {/* far legs */}
        <Leg hip={[114, 104]} knee={[94, 144]} foot={[116, 184]} far />
        <Leg hip={[228, 104]} knee={[208, 144]} foot={[230, 184]} far />

        {/* LiDAR */}
        <rect
          x={146}
          y={52}
          width={22}
          height={10}
          rx={4}
          fill="var(--mol-elevated)"
          stroke="var(--border-strong)"
          strokeWidth={2}
        />
        <rect
          x={136}
          y={60}
          width={42}
          height={18}
          rx={7}
          fill="var(--mol-elevated)"
          stroke="var(--border-strong)"
          strokeWidth={2}
        />

        {/* body */}
        <rect
          x={80}
          y={74}
          width={164}
          height={50}
          rx={20}
          fill="url(#molly-body)"
        />
        <rect
          x={94}
          y={81}
          width={136}
          height={7}
          rx={3.5}
          fill="#ffffff"
          opacity={0.28}
        />
        <text
          x={150}
          y={110}
          textAnchor="middle"
          fontSize={15}
          fontWeight={800}
          letterSpacing={3}
          fill="#ffffff"
          opacity={0.92}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          MOLLY
        </text>

        {/* head with camera */}
        <rect
          x={236}
          y={68}
          width={46}
          height={38}
          rx={13}
          fill="var(--mol-elevated)"
          stroke="var(--border-strong)"
          strokeWidth={2}
        />
        <circle
          cx={266}
          cy={87}
          r={16}
          fill="url(#molly-eye-glow)"
          className="animate-pulse-dot"
        />
        <circle cx={266} cy={87} r={7} fill="var(--brand)" />
        <circle cx={268.5} cy={84.5} r={2.2} fill="#ffffff" />

        {/* near legs */}
        <Leg hip={[102, 110]} knee={[82, 150]} foot={[104, 190]} />
        <Leg hip={[216, 110]} knee={[196, 150]} foot={[218, 190]} />
      </g>
    </svg>
  );
}
