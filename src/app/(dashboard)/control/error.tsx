"use client";

import { RouteError } from "@/components/error";

export default function ControlError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} route="Control" />;
}
