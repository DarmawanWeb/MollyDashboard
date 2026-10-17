"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  MollyButton,
  MollyField,
  MollyInput,
  MollySelect,
  MollyTextarea,
} from "@/components/ui/molly";
import type { POI, TourDefinition } from "@/types";

interface TourFormProps {
  value: TourDefinition;
  pois: POI[];
  saving: boolean;
  onChange: (patch: Partial<TourDefinition>) => void;
  onAddStop: (poiId: string) => void;
  onMoveStop: (index: number, delta: -1 | 1) => void;
  onRemoveStop: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Tour editor form. Pure presentation — all state lives in useTourEditor.
 *
 * A tour needs a name and at least one stop. Stops are the site's POIs in
 * visiting order; each POI once. The robot assigns the id of a new tour
 * from its name.
 */
export function TourForm({
  value,
  pois,
  saving,
  onChange,
  onAddStop,
  onMoveStop,
  onRemoveStop,
  onSave,
  onCancel,
}: TourFormProps) {
  const isNew = value.id === "";
  const canSave =
    value.name.trim().length > 0 && value.poiIds.length > 0 && !saving;
  const nameOf = (id: string) => pois.find((p) => p.id === id)?.name ?? id;

  const addOptions = pois
    .filter((p) => !value.poiIds.includes(p.id))
    .map((p) => ({ value: p.id, label: p.name }));
  const returnOptions = [
    { value: "", label: "Stay at the last stop" },
    ...pois.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="panel-inset p-3 flex flex-col gap-3">
      <span className="label">{isNew ? "New tour" : `Edit ${value.id}`}</span>

      <MollyField label="Name" htmlFor="tour-name" required>
        <MollyInput
          id="tour-name"
          placeholder="e.g. Highlights"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          autoFocus
        />
      </MollyField>

      <MollyField label="Description" htmlFor="tour-desc">
        <MollyTextarea
          id="tour-desc"
          placeholder="What the tour covers"
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          textareaSize="sm"
          rows={2}
        />
      </MollyField>

      <div className="flex flex-col gap-1">
        <span className="label">
          Stops ({value.poiIds.length})<span className="text-red"> *</span>
        </span>
        {value.poiIds.length === 0 && (
          <span className="text-[10px] font-mono text-txt-muted">
            Add the POIs in visiting order
          </span>
        )}
        {value.poiIds.map((id, i) => (
          <div
            key={id}
            className="flex items-center gap-1.5 border-l-2 border-l-violet bg-mol-primary px-2 py-1"
          >
            <span className="font-mono text-[10px] text-txt-muted font-bold w-4">
              {i + 1}
            </span>
            <span className="text-xs text-txt-secondary truncate flex-1">
              {nameOf(id)}
            </span>
            <MollyButton
              variant="ghost"
              size="xs"
              disabled={i === 0}
              onClick={() => onMoveStop(i, -1)}
              aria-label={`Move ${nameOf(id)} earlier`}
            >
              <ChevronUp size={10} />
            </MollyButton>
            <MollyButton
              variant="ghost"
              size="xs"
              disabled={i === value.poiIds.length - 1}
              onClick={() => onMoveStop(i, 1)}
              aria-label={`Move ${nameOf(id)} later`}
            >
              <ChevronDown size={10} />
            </MollyButton>
            <MollyButton
              variant="ghost"
              size="xs"
              onClick={() => onRemoveStop(i)}
              aria-label={`Remove ${nameOf(id)}`}
            >
              <X size={10} />
            </MollyButton>
          </div>
        ))}
        <MollySelect
          id="tour-add-stop"
          ariaLabel="Add a stop"
          value=""
          onChange={onAddStop}
          options={addOptions}
          placeholder={
            addOptions.length > 0 ? "Add a stop…" : "Every POI is a stop"
          }
          disabled={addOptions.length === 0}
          size="sm"
        />
      </div>

      <MollyField
        label="After the last stop"
        htmlFor="tour-return"
        hint="Where the robot walks when the tour ends"
      >
        <MollySelect
          id="tour-return"
          value={value.returnPoiId}
          onChange={(returnPoiId) => onChange({ returnPoiId })}
          options={returnOptions}
          size="sm"
        />
      </MollyField>

      <div className="flex gap-1.5">
        <MollyButton onClick={onSave} disabled={!canSave} className="flex-1">
          {saving ? "Saving…" : isNew ? "Add tour" : "Save"}
        </MollyButton>
        <MollyButton variant="ghost" onClick={onCancel}>
          Cancel
        </MollyButton>
      </div>
    </div>
  );
}
