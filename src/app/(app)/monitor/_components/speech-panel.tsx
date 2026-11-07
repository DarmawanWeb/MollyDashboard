"use client";

import { Loader2, Send, Square } from "lucide-react";
import { useRef, useState } from "react";
import {
  MollyButton,
  MollySelect,
  MollySwitch,
  MollyTextarea,
} from "@/components/ui/molly";
import { LANGUAGE_OPTIONS } from "@/constants/gestures";
import { useDraft } from "@/hooks/use-draft";
import { useRobotAction } from "@/hooks/use-robot-action";
import { useRobotApi } from "@/hooks/use-robot-api";
import { cn } from "@/lib/utils";
import { useInteractionStore } from "@/stores/use-interaction-store";
import { useSettingsStore } from "@/stores/use-settings-store";
import type { Language, SpeechState } from "@/types";

const STATE_TONE: Record<SpeechState, string> = {
  idle: "text-txt-tertiary",
  speaking: "text-violet",
  done: "text-txt-tertiary",
  failed: "text-red",
  cancelled: "text-txt-tertiary",
};

/**
 * Make Molly speak (/interaction/say): free text or a quick phrase, in a
 * language, optionally cutting off what she is saying. The status row
 * follows interaction/speech_status.
 */
export function SpeechPanel() {
  const api = useRobotApi();
  const { run, busy } = useRobotAction();
  const speech = useInteractionStore((s) => s.speech);
  const defaultLanguage = useSettingsStore((s) => s.interaction.language);
  const phrases = useSettingsStore((s) => s.interaction.quickPhrases);

  const [text, setText] = useState("");
  const [interrupt, setInterrupt] = useState(false);
  const language = useDraft<Language>(defaultLanguage);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const speaking = speech.state === "speaking";
  const canStop = speaking || speech.queued > 0;
  const saying = busy === "say";

  const say = (value: string, lang: Language) =>
    run("say", "Say", () => api.say(value, lang, interrupt));

  const send = async () => {
    const value = text.trim();
    if (!value || saying) return;
    const res = await say(value, language.value);
    if (res?.success) setText("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="panel-inset px-2.5 py-1.5 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("label", STATE_TONE[speech.state])}>
            {speech.state}
            {speech.engine ? ` · ${speech.engine}` : ""}
            {speech.queued > 0 ? ` · ${speech.queued} queued` : ""}
          </span>
          <MollyButton
            variant="danger"
            size="xs"
            disabled={!canStop || busy === "stop"}
            onClick={() => run("stop", "Stop speech", () => api.stopSpeech())}
          >
            <Square size={10} />
            Stop
          </MollyButton>
        </div>
        {speech.text && (
          <p
            className={cn(
              "text-[10px] font-mono line-clamp-2",
              speaking ? "text-txt-secondary" : "text-txt-muted",
            )}
            title={speech.text}
          >
            {speech.language && (
              <span className="text-cyan">
                {speech.language.toUpperCase()}{" "}
              </span>
            )}
            {speech.text}
          </p>
        )}
        {speech.state === "failed" && speech.message && (
          <p className="text-[10px] font-mono text-red">{speech.message}</p>
        )}
      </div>

      <div className="relative">
        <MollyTextarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Say something… (Enter)"
          aria-label="Text for Molly to say"
          textareaSize="sm"
          rows={2}
          className="w-full min-h-14 max-h-28 pr-10"
        />
        <MollyButton
          size="xs"
          onClick={send}
          disabled={!text.trim() || saying}
          aria-label="Say"
          title="Say (Enter)"
          className="absolute bottom-2 right-2"
        >
          {saying ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
        </MollyButton>
      </div>

      <div className="flex items-center gap-2">
        <MollySelect
          id="speech-language"
          ariaLabel="Speech language"
          value={language.value}
          onChange={language.set}
          options={LANGUAGE_OPTIONS}
          size="sm"
          className="flex-1 min-w-0"
        />
        <span className="text-xs text-txt-secondary">Interrupt</span>
        <MollySwitch
          checked={interrupt}
          onChange={setInterrupt}
          ariaLabel="Interrupt what Molly is saying"
          size="sm"
        />
      </div>

      {phrases.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="label">Quick phrases</span>
          <div className="flex flex-col gap-1">
            {phrases.map((phrase, i) => (
              <MollyButton
                key={`${i}-${phrase.text}`}
                variant="ghost"
                size="xs"
                disabled={saying}
                onClick={() => say(phrase.text, phrase.language)}
                title={phrase.text}
                className="justify-start normal-case tracking-normal font-normal"
              >
                <span className="text-cyan font-semibold shrink-0">
                  {phrase.language ? phrase.language.toUpperCase() : "—"}
                </span>
                <span className="truncate">{phrase.text}</span>
              </MollyButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
