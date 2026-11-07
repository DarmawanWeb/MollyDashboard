import {
  Cpu,
  Eye,
  type LucideIcon,
  Map as MapIcon,
  MonitorPlay,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  /** Shown under the page title in the top bar */
  subtitle: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: "visitor" | "operator";
  label: string;
  items: NavItem[];
}

/** Sidebar navigation: the visitor display, then the operator pages. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "visitor",
    label: "Visitor",
    items: [
      {
        href: "/",
        label: "Showcase",
        subtitle: "Visitor display for the experience center",
        icon: MonitorPlay,
      },
    ],
  },
  {
    id: "operator",
    label: "Operator",
    items: [
      {
        href: "/monitor",
        label: "Monitor",
        subtitle: "Live tour, speech, visitors and Ask Molly",
        icon: Eye,
      },
      {
        href: "/mapping",
        label: "Mapping",
        subtitle: "Sites, map, AprilTags, points of interest and tours",
        icon: MapIcon,
      },
      {
        href: "/system",
        label: "System",
        subtitle: "Robot computer health, ROS nodes and logs",
        icon: Cpu,
      },
      {
        href: "/settings",
        label: "Settings",
        subtitle: "Connection, AI assistant, camera, speech and look",
        icon: Settings,
      },
    ],
  },
];

const ALL = NAV_SECTIONS.flatMap((s) => s.items);

export function isActivePath(href: string, pathname: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav item of a path (for the top bar title). */
export function navItemFor(pathname: string): NavItem {
  return ALL.find((item) => isActivePath(item.href, pathname)) ?? ALL[0];
}
