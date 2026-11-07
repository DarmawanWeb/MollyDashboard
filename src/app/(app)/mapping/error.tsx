"use client";

import { RouteError } from "@/components/error";

export default function MappingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} route="Mapping" />;
}
