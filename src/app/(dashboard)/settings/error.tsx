"use client";

import { RouteError } from "@/components/error";

export default function SettingsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} route="Settings" />;
}
