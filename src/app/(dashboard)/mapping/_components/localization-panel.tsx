"use client";

import { LocateFixed, ScanLine } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { MollyButton } from "@/components/ui/molly";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { useRobotStore } from "@/stores/use-robot-store";
import { useSiteStore } from "@/stores/use-site-store";

/**
 * AprilTag localization: localize from a visible tag, record the visible
 * tags into the active site (their map poses anchor the map).
 */
export function LocalizationPanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const localization = useRobotStore((s) => s.localization);
  const tags = useSiteStore((s) => s.status.tagCount);
  const hasSite = useSiteStore((s) => s.status.site !== "");

  return (
    <AppSection title="Localization" icon={<LocateFixed size={16} />}>
      <div className="flex flex-col gap-2">
        <div className="panel-inset px-3 py-2 flex items-center justify-between">
          <span
            className={`font-mono text-xs ${
              localization.localized ? "text-cyan" : "text-amber"
            }`}
          >
            {localization.localized
              ? `localized · ${localization.raw}`
              : "not localized"}
          </span>
          <span className="font-mono text-[10px] text-txt-muted">
            {tags} tags
          </span>
        </div>
        <div className="flex gap-1.5">
          <MollyButton
            variant="ghost"
            className="flex-1"
            disabled={!hasSite || busy !== null}
            onClick={() =>
              run("localize", "Localize from a tag", () => api.localize(), {
                successToast: true,
              })
            }
          >
            <LocateFixed size={12} /> Localize
          </MollyButton>
          <MollyButton
            variant="ghost"
            className="flex-1"
            disabled={!hasSite || busy !== null}
            title="Stand still in view of the tags first"
            onClick={() =>
              run("record", "Record tags", () => api.recordTags(), {
                successToast: true,
              })
            }
          >
            <ScanLine size={12} /> Record tags
          </MollyButton>
        </div>
      </div>
    </AppSection>
  );
}
