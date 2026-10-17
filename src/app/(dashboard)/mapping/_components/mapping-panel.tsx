"use client";

import { Play, Save, Square } from "lucide-react";
import { useState } from "react";
import { AppSection } from "@/components/layout/app/section";
import {
  MollyButton,
  MollyField,
  MollyInput,
  MollySwitch,
} from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { isValidId, toId } from "@/lib/site/codec";
import { useSiteStore } from "@/stores/use-site-store";

/**
 * Record a site: start mapping (new or continue), drive the robot around,
 * save the occupancy grid, stop. AprilTags and POIs are recorded alongside
 * (Localization and POI sections).
 */
export function MappingPanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const mapping = useSiteStore((s) => s.mapping);
  const activeSite = useSiteStore((s) => s.status.site);
  const [name, setName] = useState("");
  const [reset, setReset] = useState(true);

  const site = toId(name || activeSite);
  const valid = isValidId(site);

  return (
    <AppSection title="Mapping" icon={<Play size={16} />}>
      <div className="flex flex-col gap-2.5">
        {!mapping.active && (
          <>
            <MollyField
              label="Site name"
              htmlFor="mapping-site"
              hint={site ? `saved as map/${site}/` : "a-z, 0-9, - and _"}
            >
              <MollyInput
                id="mapping-site"
                inputSize="sm"
                placeholder={activeSite || "e.g. lobby-east"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MollyField>
            <div className="flex items-center justify-between">
              <span className="text-xs text-txt-secondary">
                Start from an empty map
              </span>
              <MollySwitch
                checked={reset}
                onChange={setReset}
                ariaLabel="Start from an empty map"
                size="sm"
              />
            </div>
          </>
        )}

        <div className="flex gap-1.5">
          {mapping.active ? (
            <MollyButton
              variant="danger"
              className="flex-1"
              disabled={busy !== null}
              onClick={() =>
                run("stop", "Stop mapping", () => api.stopMapping())
              }
            >
              <Square size={13} /> Stop
            </MollyButton>
          ) : (
            <MollyButton
              className="flex-1"
              disabled={!valid || busy !== null}
              onClick={() =>
                run(
                  "start",
                  `Start mapping ${site}`,
                  () => api.startMapping(site, reset),
                  { successToast: true },
                )
              }
            >
              <Play size={13} /> Start
            </MollyButton>
          )}
          <MollyButton
            variant="ghost"
            disabled={!mapping.active || busy !== null}
            onClick={() =>
              run("save", "Save map", () => api.saveMap(), {
                successToast: true,
              })
            }
          >
            <Save size={13} /> Save map
          </MollyButton>
        </div>

        <div className="panel-inset px-3 py-2 flex items-center gap-2">
          <div
            aria-hidden
            className={`w-2 h-2 rounded-full ${
              mapping.active
                ? "bg-green motion-safe:animate-pulse"
                : "bg-txt-muted"
            }`}
          />
          <span
            aria-live="polite"
            className="font-mono text-xs text-txt-secondary truncate"
          >
            {mapping.active
              ? `${mapping.site} · ${mapping.scans} scans · ${mapping.knownAreaM2.toFixed(0)} m²`
              : mapping.message || "not mapping"}
          </span>
        </div>

        {mapping.active && (
          <p className="text-[10px] text-txt-muted leading-relaxed">
            Drive the robot through the whole place in REMOTE (Control page or
            the handheld). Stop in view of each AprilTag and record it, add POIs
            on the way, then save the map.
          </p>
        )}
      </div>
    </AppSection>
  );
}
