"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  MollyButton,
  MollyField,
  MollyInput,
  MollySelect,
} from "@/components/ui/molly";
import { LANGUAGE_OPTIONS } from "@/constants/gestures";
import { useDraft } from "@/hooks/use-draft";
import { useSettingsStore } from "@/stores/use-settings-store";
import { SettingsSection } from "./settings-section";

const MAX_PHRASES = 12;

/**
 * Speech defaults: the language the speech and conversation panels start
 * with, and the one-tap phrases of the speech panel.
 */
export function InteractionSection() {
  const { language, quickPhrases } = useSettingsStore((s) => s.interaction);
  const setInteraction = useSettingsStore((s) => s.setInteraction);

  const [text, setText] = useState("");
  const phraseLanguage = useDraft(language);
  const full = quickPhrases.length >= MAX_PHRASES;

  const add = () => {
    const value = text.trim();
    if (!value || full) return;
    setInteraction({
      quickPhrases: [
        ...quickPhrases,
        { text: value, language: phraseLanguage.value },
      ],
    });
    setText("");
  };

  const remove = (index: number) =>
    setInteraction({
      quickPhrases: quickPhrases.filter((_, i) => i !== index),
    });

  return (
    <SettingsSection
      icon={<MessageSquare size={18} />}
      title="Interaction"
      iconColor="text-violet"
    >
      <div className="flex flex-col gap-3">
        <MollyField
          label="Default language"
          htmlFor="interaction-language"
          hint="The speech and conversation panels start with it"
        >
          <MollySelect
            id="interaction-language"
            value={language}
            onChange={(value) => setInteraction({ language: value })}
            options={LANGUAGE_OPTIONS}
          />
        </MollyField>

        <div className="flex flex-col gap-1">
          <span className="label">
            Quick phrases ({quickPhrases.length}/{MAX_PHRASES})
          </span>
          {quickPhrases.length === 0 && (
            <span className="text-[10px] font-mono text-txt-muted">
              None yet
            </span>
          )}
          {quickPhrases.map((phrase, i) => (
            <div
              key={`${i}-${phrase.text}`}
              className="panel-inset px-2.5 py-1.5 flex items-center gap-2"
            >
              <span className="font-mono text-[10px] font-bold text-cyan w-5 shrink-0">
                {phrase.language ? phrase.language.toUpperCase() : "—"}
              </span>
              <span
                className="text-xs text-txt-secondary truncate flex-1"
                title={phrase.text}
              >
                {phrase.text}
              </span>
              <MollyButton
                variant="ghost"
                size="xs"
                onClick={() => remove(i)}
                aria-label={`Remove "${phrase.text}"`}
              >
                <Trash2 size={10} />
              </MollyButton>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <MollyInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="New phrase…"
            aria-label="New quick phrase"
            inputSize="sm"
            className="flex-1 min-w-0"
          />
          <MollySelect
            value={phraseLanguage.value}
            onChange={phraseLanguage.set}
            options={LANGUAGE_OPTIONS}
            ariaLabel="Language of the new phrase"
            size="sm"
            className="w-36"
          />
          <MollyButton size="sm" onClick={add} disabled={!text.trim() || full}>
            <Plus size={12} />
            Add
          </MollyButton>
        </div>
      </div>
    </SettingsSection>
  );
}
