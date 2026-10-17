/**
 * Molly UI primitives — dark, industrial form controls.
 *
 * These wrap @base-ui/react components with Molly design tokens. Use these
 * over native <input>/<select> in all new code so dropdowns render in the
 * dashboard's dark popup style instead of browser default chrome.
 *
 * Usage:
 *   import {
 *     MollyField,
 *     MollyInput,
 *     MollySelect,
 *     MollyNumberInput,
 *     MollyTextarea,
 *     MollySwitch,
 *     MollyConfirmButton,
 *   } from "@/components/ui/molly";
 */

export { MollyButton } from "./button";
export { MollyConfirmButton } from "./confirm-button";
export { MollyField } from "./field";
export { MollyInput } from "./input";
export { MollyNumberInput } from "./number-input";
export {
  MollySelect,
  type MollySelectOption,
} from "./select";
export { MollySwitch } from "./switch";
export { MollyTextarea } from "./textarea";
