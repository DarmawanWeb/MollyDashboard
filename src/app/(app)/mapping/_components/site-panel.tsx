"use client";

import { Building2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton, MollySelect } from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useSiteStore } from "@/stores/use-site-store";

/**
 * Pick the active site: its map, POIs, tours and AprilTags (/site/load).
 */
export function SitePanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const status = useSiteStore((s) => s.status);
  const [choice, setChoice] = useState("");

  const value = choice || status.site;
  const options = status.sites.map((s) => ({
    value: s,
    label: s === status.site ? `${s} (active)` : s,
  }));

  return (
    <AppSection title="Site" icon={<Building2 size={16} />}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          <div className="flex-1 min-w-0">
            <MollySelect
              id="site-select"
              ariaLabel="Site"
              value={value}
              onChange={setChoice}
              options={options}
              placeholder="No sites yet"
              size="sm"
              disabled={options.length === 0 || status.mapping}
            />
          </div>
          <MollyButton
            size="sm"
            disabled={!value || value === status.site || busy !== null}
            onClick={async () => {
              const res = await run(
                "load",
                `Load ${value}`,
                () => api.loadSite(value),
                { successToast: true },
              );
              if (res?.success) setChoice("");
            }}
          >
            <RefreshCw
              size={12}
              className={busy === "load" ? "animate-spin" : ""}
            />
            Load
          </MollyButton>
        </div>

        <div className="grid grid-cols-4 gap-1 font-mono text-[10px] text-center">
          <Count label="map" value={status.hasMap ? "yes" : "no"} />
          <Count label="tags" value={status.tagCount} />
          <Count label="POIs" value={status.poiCount} />
          <Count label="tours" value={status.tourCount} />
        </div>

        {status.message && (
          <div className="text-[10px] text-txt-tertiary font-mono truncate">
            {status.message}
          </div>
        )}
      </div>
    </AppSection>
  );
}

function Count({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel-inset py-1.5">
      <div className="text-txt-primary text-xs">{value}</div>
      <div className="text-txt-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
