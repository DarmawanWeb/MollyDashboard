/**
 * Builders for rcl_interfaces parameter services (get/set node parameters).
 */

import type {
  Parameter,
  ParameterValue,
  SetParametersResponse,
} from "@/types/ros/rcl";

/** rcl_interfaces/msg/ParameterType values */
export const PARAMETER_TYPE = {
  NOT_SET: 0,
  BOOL: 1,
  INTEGER: 2,
  DOUBLE: 3,
  STRING: 4,
} as const;

export function doubleParameter(name: string, value: number): Parameter {
  return {
    name,
    value: { type: PARAMETER_TYPE.DOUBLE, double_value: value },
  };
}

export function boolParameter(name: string, value: boolean): Parameter {
  return { name, value: { type: PARAMETER_TYPE.BOOL, bool_value: value } };
}

/** Numeric value of a ParameterValue, or null when it is not a number. */
export function numberValue(value: ParameterValue | undefined): number | null {
  if (!value) return null;
  if (value.type === PARAMETER_TYPE.DOUBLE) return value.double_value ?? null;
  if (value.type === PARAMETER_TYPE.INTEGER) return value.integer_value ?? null;
  return null;
}

/** First failure reason of a SetParameters response, or null when all succeeded. */
export function setParametersError(res: SetParametersResponse): string | null {
  const failed = res.results.find((r) => !r.successful);
  return failed ? failed.reason || "rejected" : null;
}
