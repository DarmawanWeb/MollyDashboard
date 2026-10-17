"use client";

import { useCallback, useState } from "react";
import { toast } from "@/stores/use-toast-store";
import type { ActionResult } from "@/types/ui";

interface Options {
  /** Toast on success too (failures always toast). */
  successToast?: boolean;
}

/**
 * Run robot actions from buttons: tracks which action is busy and turns a
 * failed ActionResult (or a thrown error) into an error toast.
 *
 *   const { run, busy } = useRobotAction();
 *   <MollyButton disabled={busy === "save"} onClick={() => run("save", "Save map", () => api.saveMap())} />
 */
export function useRobotAction() {
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async <T extends ActionResult>(
      key: string,
      label: string,
      action: () => Promise<T>,
      options: Options = {},
    ): Promise<T | null> => {
      setBusy(key);
      try {
        const res = await action();
        if (!res.success) {
          toast.error(`${label} failed`, res.message || undefined);
        } else if (options.successToast) {
          toast.success(label, res.message || undefined);
        }
        return res;
      } catch (err) {
        toast.error(
          `${label} failed`,
          err instanceof Error ? err.message : String(err),
        );
        return null;
      } finally {
        setBusy((current) => (current === key ? null : current));
      }
    },
    [],
  );

  return { run, busy };
}
