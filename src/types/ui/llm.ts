/**
 * LLM and operator communication message types.
 */

export type LLMRole = "visitor" | "molly" | "system" | "operator";

export interface LLMMessage {
  role: LLMRole;
  text: string;
  /** HH:MM:SS local time string */
  timestamp: string;
}
