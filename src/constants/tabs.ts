import { Eye, Gamepad2, Map as MapIcon, Monitor, Settings } from "lucide-react";

export const TABS = [
  {
    href: "/monitor",
    label: "Monitor",
    icon: Eye,
  },
  {
    href: "/control",
    label: "Control",
    icon: Gamepad2,
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
