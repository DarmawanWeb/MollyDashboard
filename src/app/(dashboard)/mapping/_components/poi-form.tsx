"use client";

import { Crosshair } from "lucide-react";
import { MollyButton } from "@/components/ui/molly/button";
import { MollyField } from "@/components/ui/molly/field";
import { MollyInput } from "@/components/ui/molly/input";
import { MollyNumberInput } from "@/components/ui/molly/number-input";
import { MollySelect } from "@/components/ui/molly/select";
import { MollyTextarea } from "@/components/ui/molly/textarea";
import { GESTURE_OPTIONS, LANGUAGE_OPTIONS } from "@/constants/gestures";
import { parseLanguage } from "@/lib/site/codec";
import type { POI } from "@/types";

interface POIFormProps {
  value: POI;
  atRobotPose: boolean;
  saving: boolean;
  onChange: (patch: Partial<POI>) => void;
  onPickOnMap: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const toDeg = (rad: number) => Math.round((rad * 180) / Math.PI);

/**
 * POI editor form. Pure presentation — all state lives in usePoiEditor.
 *
 * Submission is disabled until the name field is non-empty (trimmed), since
 * name is the only user-required field. The robot assigns the id of a new
 * POI from its name.
 */
export function POIForm({
  value,
  atRobotPose,
  saving,
  onChange,
  onPickOnMap,
  onSave,
  onCancel,
}: POIFormProps) {
  const canSave = value.name.trim().length > 0 && !saving;
  const isNew = value.id === "";

  return (
    <div className="panel-inset p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label">{isNew ? "New POI" : `Edit ${value.id}`}</span>
        <span className="font-mono text-[10px] text-txt-muted">
          {atRobotPose
            ? "at the robot's pose"
            : `${value.x.toFixed(2)}, ${value.y.toFixed(2)} m · ${toDeg(value.yaw)}°`}
        </span>
      </div>

      <MollyField label="Name" htmlFor="poi-name" required>
        <MollyInput
          id="poi-name"
          placeholder="e.g. Lobby entrance"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          autoFocus
        />
      </MollyField>

      <MollyField label="Description" htmlFor="poi-desc">
        <MollyInput
          id="poi-desc"
          placeholder="What visitors see here"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </MollyField>

      <MollyField
        label="Narration"
        htmlFor="poi-narration"
        hint="Spoken by the robot on arrival"
      >
        <MollyTextarea
          id="poi-narration"
          placeholder="Selamat datang di…"
          rows={3}
          value={value.narration}
          onChange={(e) => onChange({ narration: e.target.value })}
        />
      </MollyField>

      <div className="grid grid-cols-2 gap-2">
        <MollyField label="Language" htmlFor="poi-language">
          <MollySelect
            id="poi-language"
            value={value.language}
            onChange={(v) => onChange({ language: parseLanguage(v) })}
            options={LANGUAGE_OPTIONS}
          />
        </MollyField>

        <MollyField label="Gesture" htmlFor="poi-gesture">
          <MollySelect
            id="poi-gesture"
            value={value.gesture}
            onChange={(v) => onChange({ gesture: v })}
            options={GESTURE_OPTIONS}
          />
        </MollyField>
      </div>

      <MollyField label="Dwell after narration (s)" htmlFor="poi-dwell">
        <MollyNumberInput
          id="poi-dwell"
          min={0}
          max={600}
          step={1}
          precision={0}
          value={value.dwellSec}
          onChange={(n) => onChange({ dwellSec: n })}
        />
      </MollyField>

      <div className="flex gap-1.5 pt-1">
        <MollyButton
          variant="primary"
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 justify-center"
        >
          {saving ? "Saving…" : isNew ? "Add POI" : "Update"}
        </MollyButton>
        <MollyButton
          variant="ghost"
          onClick={onPickOnMap}
          title="Click the map for the position, drag for the heading"
        >
          <Crosshair size={12} /> Map
        </MollyButton>
        <MollyButton variant="ghost" onClick={onCancel}>
          Cancel
        </MollyButton>
      </div>
    </div>
  );
}
