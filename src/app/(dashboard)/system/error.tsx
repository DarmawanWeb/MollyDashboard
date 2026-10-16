"use client";

import { RouteError } from "@/components/error";

export default function SystemError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} route="System" />;
}
