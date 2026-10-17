/**
 * Gestures the robot offers through /interaction/gesture (the Lite3 driver's
 * gesture services). A POI can perform one on arrival.
 */
export const GESTURES = [
  { value: "hello", label: "Hello (wave)" },
  { value: "nod", label: "Nod" },
  { value: "bow", label: "Bow" },
  { value: "look_left", label: "Look left" },
  { value: "look_right", label: "Look right" },
] as const;

/** Select options with "none" first, for the POI form. */
export const GESTURE_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  [{ value: "", label: "No gesture" }, ...GESTURES];

/** Narration / speech language options; empty = the robot's default. */
export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  [
    { value: "", label: "Robot default" },
    { value: "id", label: "Bahasa Indonesia" },
    { value: "en", label: "English" },
  ];
