"use client";

import { MollyButton } from "@/components/ui/molly/button";
import { MollyField } from "@/components/ui/molly/field";
import { MollyInput } from "@/components/ui/molly/input";
import { MollyNumberInput } from "@/components/ui/molly/number-input";
import { MollySelect } from "@/components/ui/molly/select";
import { MollyTextarea } from "@/components/ui/molly/textarea";
import type { MotionAction } from "@/types";
import { MOTION_ACTIONS } from "../_data/motion-actions";
import type { POIForm as POIFormValues } from "../_hooks/use-poi-editor";

interface POIFormProps {
  mode: "create" | "edit";
  value: POIFormValues;
  onChange: (
    next: POIFormValues | ((prev: POIFormValues) => POIFormValues),
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * POI editor form. Pure presentation — all state lives in usePoiEditor.
 *
 * Submission is disabled until the name field is non-empty (trimmed), since
 * name is the only user-required field. Dwell time is clamped at the input
 * level via min/max but additional sanitization happens in saveForm().
 */
export function POIForm({
  mode,
  value,
  onChange,
  onSave,
  onCancel,
}: POIFormProps) {
  const canSave = value.name.trim().length > 0;
  const motionOptions = MOTION_ACTIONS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  return (
    <div className="panel-inset p-3 flex flex-col gap-3">
      <span className="label">{mode === "edit" ? "Edit POI" : "New POI"}</span>

      <MollyField label="Name" htmlFor="poi-name" required>
        <MollyInput
          id="poi-name"
          placeholder="e.g. Lobby entrance"
          value={value.name}
          onChange={(e) => onChange((f) => ({ ...f, name: e.target.value }))}
          autoFocus
        />
      </MollyField>

      <MollyField label="Description" htmlFor="poi-desc">
        <MollyInput
          id="poi-desc"
          placeholder="Short context for operators"
          value={value.description}
          onChange={(e) =>
            onChange((f) => ({ ...f, description: e.target.value }))
          }
        />
      </MollyField>

      <MollyField
        label="Narration"
        htmlFor="poi-narration"
        hint="Spoken by the robot when stopping here"
      >
        <MollyTextarea
          id="poi-narration"
          placeholder="Welcome to the lobby…"
          rows={3}
          value={value.narrationText}
          onChange={(e) =>
            onChange((f) => ({ ...f, narrationText: e.target.value }))
          }
        />
      </MollyField>

      <div className="grid grid-cols-2 gap-2">
        <MollyField label="Motion" htmlFor="poi-motion">
          <MollySelect
            id="poi-motion"
            value={value.motionAction}
            onChange={(v) =>
              onChange((f) => ({ ...f, motionAction: v as MotionAction }))
            }
            options={motionOptions}
          />
        </MollyField>

        <MollyField label="Dwell (s)" htmlFor="poi-dwell">
          <MollyNumberInput
            id="poi-dwell"
            min={5}
            max={300}
            step={1}
            value={value.dwellTimeSec}
            onChange={(n) => onChange((f) => ({ ...f, dwellTimeSec: n ?? 30 }))}
          />
        </MollyField>
      </div>

      <div className="flex gap-1.5 pt-1">
        <MollyButton
          variant="primary"
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 justify-center"
        >
          {mode === "edit" ? "Update" : "Add POI"}
        </MollyButton>
        <MollyButton variant="ghost" onClick={onCancel}>
          Cancel
        </MollyButton>
      </div>
    </div>
  );
}
