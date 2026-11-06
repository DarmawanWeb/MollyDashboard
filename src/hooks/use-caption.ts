"use client";

import { useEffect, useState } from "react";
import { useInteractionStore } from "@/stores/use-interaction-store";

/** How long a finished sentence stays up, so people can finish reading it. */
const LINGER_MS = 4000;

/**
 * Live caption of what Molly says (interaction/speech_status): the sentence
 * being spoken, or the last one for a few seconds after she finishes.
 */
export function useCaption(): { text: string | null; speaking: boolean } {
  const speech = useInteractionStore((s) => s.speech);
  const speaking = speech.state === "speaking" && speech.text !== "";
  const [lingering, setLingering] = useState<string | null>(null);

  useEffect(() => {
    if (speaking) {
      setLingering(speech.text);
      return;
    }
    const timer = setTimeout(() => setLingering(null), LINGER_MS);
    return () => clearTimeout(timer);
  }, [speaking, speech.text]);

  return { text: speaking ? speech.text : lingering, speaking };
}
