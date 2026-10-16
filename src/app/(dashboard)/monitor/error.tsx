"use client";

import { RouteError } from "@/components/error";

export default function MonitorError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} route="Monitor" />;
}
