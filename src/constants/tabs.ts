import { Eye, Map as MapIcon, Monitor, Settings } from "lucide-react";

/** Operator pages (the visitor display lives at /). */
export const TABS = [
  {
    href: "/monitor",
    label: "Monitor",
    icon: Eye,
  },
  {
    href: "/mapping",
    label: "Mapping",
    icon: MapIcon,
  },
  {
    href: "/system",
    label: "System",
    icon: Monitor,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;
