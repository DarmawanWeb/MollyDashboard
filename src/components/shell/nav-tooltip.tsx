"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

/**
 * Label to the right of a sidebar item, only while the sidebar is
 * collapsed to icons. `children` is the trigger element (a link).
 */
export function NavTooltip({
  label,
  enabled,
  children,
}: {
  label: ReactNode;
  enabled: boolean;
  children: ReactElement;
}) {
  return (
    <Tooltip.Root disabled={!enabled}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={14} className="z-[60]">
          <Tooltip.Popup className="rounded-lg bg-txt-primary px-2.5 py-1.5 text-xs font-semibold text-mol-root shadow-card-lg transition-[opacity,transform] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:-translate-x-1 data-[starting-style]:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
