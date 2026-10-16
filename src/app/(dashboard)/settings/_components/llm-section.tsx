"use client";

import { Save, Zap } from "lucide-react";
import {
  MollyButton,
  MollyField,
  MollyInput,
  MollySelect,
} from "@/components/ui/molly";
import { useSettingsStore } from "@/stores/use-settings-store";
import { LLM_PROVIDER_OPTIONS } from "../_data/options";
import { SettingsSection } from "./settings-section";

export function LlmSection() {
  const { provider, apiKey, model } = useSettingsStore((s) => s.llm);
  const setLlm = useSettingsStore((s) => s.setLlm);

  return (
    <SettingsSection
      icon={<Zap size={18} />}
      title="LLM Provider"
      iconColor="text-violet"
    >
      <div className="flex flex-col gap-3">
        <MollyField label="Provider" htmlFor="llm-provider">
          <MollySelect
            id="llm-provider"
            value={provider}
            onChange={(v) => setLlm({ provider: v })}
            options={LLM_PROVIDER_OPTIONS}
          />
        </MollyField>

        <MollyField
          label="API Key"
          htmlFor="llm-key"
          hint="Stored in localStorage — internal use only"
        >
          <MollyInput
            id="llm-key"
            type="password"
            value={apiKey}
            onChange={(e) => setLlm({ apiKey: e.target.value })}
            placeholder="sk-…"
          />
        </MollyField>

        <MollyField label="Model" htmlFor="llm-model">
          <MollyInput
            id="llm-model"
            value={model}
            onChange={(e) => setLlm({ model: e.target.value })}
          />
        </MollyField>

        <MollyButton className="self-start">
          <Save size={13} /> Save
        </MollyButton>
      </div>
    </SettingsSection>
  );
}
