"use client";

import { Footprints, Hand, Loader2, Ruler, Users } from "lucide-react";
import { Stat } from "@/components/robot";
import { MollyButton, MollySwitch } from "@/components/ui/molly";
import { GESTURES } from "@/constants/gestures";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useRobotStore } from "@/stores/use-robot-store";

function meters(m: number | null): string {
  return m === null ? "—" : `${m.toFixed(1)} m`;
}

function since(seconds: number | null): string {
  if (seconds === null) return "never";
  if (seconds < 60) return `${Math.round(seconds)} s ago`;
  return `${Math.floor(seconds / 60)} min ago`;
}

/**
 * Who is around and how Molly greets them: perception/visitors, the idle
 * greeter (/interaction/set_greeter, /interaction/greet) and one-tap
 * gestures (/interaction/gesture).
 */
export function VisitorPanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const visitors = useInteractionStore((s) => s.visitors);
  const greeter = useInteractionStore((s) => s.greeter);
  const gesture = useRobotStore((s) => s.lite3?.gesture ?? "");

  const gesturing = busy?.startsWith("gesture-") ?? false;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        <Stat
          icon={<Users size={13} />}
          label="Around"
          value={String(visitors.count)}
          tone={visitors.count > 0 ? "text-cyan" : "text-txt-muted"}
        />
        <Stat
          icon={<Footprints size={13} />}
          label="Behind"
          value={String(visitors.behind)}
          tone={visitors.behind > 0 ? "text-txt-primary" : "text-txt-muted"}
          hint={`${visitors.behind} following, ${visitors.front} in front`}
        />
        <Stat
          icon={<Ruler size={13} />}
          label="Nearest"
          value={meters(visitors.nearest)}
          hint={`front ${meters(visitors.nearestFront)}, behind ${meters(visitors.nearestBehind)}`}
        />
      </div>

      <div className="panel-inset px-2.5 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-txt-secondary">Greet visitors</span>
            <span className="text-[10px] font-mono text-txt-muted truncate">
              {greeter
                ? `${greeter.state || "—"} · last ${since(greeter.lastGreetAge)}`
                : "greeter not running"}
            </span>
          </div>
          <MollySwitch
            checked={greeter?.enabled ?? false}
            onChange={(on) =>
              run("greeter", on ? "Greeter on" : "Greeter off", () =>
                api.setGreeter(on),
              )
            }
            disabled={!greeter || busy === "greeter"}
            ariaLabel="Greet visitors when the robot is idle"
            size="sm"
          />
        </div>
        <MollyButton
          variant="secondary"
          size="xs"
          disabled={busy === "greet"}
          onClick={() => run("greet", "Greet", () => api.greet())}
        >
          {busy === "greet" ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Hand size={12} />
          )}
          Greet now
        </MollyButton>
      </div>

      <div className="flex flex-col gap-1">
        <span className="label">
          Gestures
          {gesture ? <span className="text-cyan"> · {gesture}</span> : null}
        </span>
        <div className="flex flex-wrap gap-1">
          {GESTURES.map((g) => (
            <MollyButton
              key={g.value}
              variant="ghost"
              size="xs"
              disabled={gesturing}
              onClick={() =>
                run(`gesture-${g.value}`, g.label, () => api.gesture(g.value))
              }
            >
              {busy === `gesture-${g.value}` && (
                <Loader2 size={10} className="animate-spin" />
              )}
              {g.label}
            </MollyButton>
          ))}
        </div>
      </div>
    </div>
  );
}
