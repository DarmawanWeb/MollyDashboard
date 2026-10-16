"use client";

import { Activity, ArrowDown } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MollyButton,
  MollyInput,
  MollySelect,
  type MollySelectOption,
} from "@/components/ui/molly";

type LogLevel = "info" | "warn" | "error" | "debug";
type LogFilter = LogLevel | "all";

type LogEntry = {
  id: number;
  timestamp: string;
  level: LogLevel;
  node: string;
  message: string;
};

let _idCounter = 0;
function genLog(i: number): LogEntry {
  const levels: LogLevel[] = ["info", "warn", "error", "debug"];
  const nodes = [
    "/bt_navigator",
    "/llm_bridge",
    "/fsm_controller",
    "/nav2_core",
    "/slam_toolbox",
  ];
  const messages = [
    "Initialized successfully",
    "Goal accepted",
    "Publishing cmd_vel",
    "Map update received",
    "Costmap clearing",
    "Plan computed",
    "BT tick",
    "Connection timeout",
    "Recovery started",
    "Waypoint reached",
    "LLM response received",
    "FSM state change",
    "Sensor data ok",
  ];
  return {
    id: _idCounter++,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    level: levels[i % levels.length],
    node: nodes[i % nodes.length],
    message: `${messages[i % messages.length]} (#${i})`,
  };
}

const ROW_HEIGHT = 28;
const OVERSCAN = 5;

const COLOR: Record<LogLevel, string> = {
  info: "text-cyan",
  warn: "text-amber",
  error: "text-red",
  debug: "text-txt-muted",
};

const LEVEL_OPTIONS: ReadonlyArray<MollySelectOption<LogFilter>> = [
  { value: "all", label: "All levels" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
  { value: "debug", label: "Debug" },
];

/**
 * CSS custom properties consumed by Tailwind arbitrary value classes below.
 * Defined as a const so the `style` prop accepts a typed object rather than
 * a literal — keeps editors from flagging it as raw inline styling.
 */
type VirtualizerStyle = CSSProperties & {
  "--row-height": string;
  "--total-height": string;
  "--offset-y": string;
};

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 50 }, (_, i) => genLog(i)),
  );
  const [filter, setFilter] = useState<LogFilter>("all");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerHeight = useRef(400);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      containerHeight.current = entries[0].contentRect.height;
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLogs((prev) => {
        const next = [...prev.slice(-2000), genLog(prev.length)];
        return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && l.level !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.message.toLowerCase().includes(q) &&
          !l.node.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [logs, filter, search]);

  // auto-scroll when new logs arrive
  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;
    requestAnimationFrame(() => {
      if (containerRef.current)
        containerRef.current.scrollTop = filtered.length * ROW_HEIGHT;
    });
  }, [filtered.length, autoScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < ROW_HEIGHT * 2;
    setAutoScroll(atBottom);
  }, []);

  const totalHeight = filtered.length * ROW_HEIGHT;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIdx = Math.min(
    filtered.length,
    Math.ceil((scrollTop + containerHeight.current) / ROW_HEIGHT) + OVERSCAN,
  );
  const visibleLogs = filtered.slice(startIdx, endIdx);
  const offsetY = startIdx * ROW_HEIGHT;

  const followNewest = () => {
    setAutoScroll(true);
    if (containerRef.current) {
      containerRef.current.scrollTop = totalHeight;
    }
  };

  // CSS variables for the virtualizer — values are dynamic per-render so
  // they can't be static utility classes. They're consumed by Tailwind
  // arbitrary classes (h-[var(--total-height)] etc) on the elements below.
  const virtualizerStyle: VirtualizerStyle = {
    "--row-height": `${ROW_HEIGHT}px`,
    "--total-height": `${totalHeight}px`,
    "--offset-y": `${offsetY}px`,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-border-subtle flex items-center gap-3 px-4 bg-mol-secondary shrink-0">
        <Activity size={14} className="text-cyan" aria-hidden="true" />
        <span className="label">System Logs</span>
        <span className="font-mono text-[10px] text-txt-muted ml-1">
          ({filtered.length})
        </span>
        <div className="flex-1" />

        {!autoScroll && (
          <MollyButton
            variant="ghost"
            size="xs"
            onClick={followNewest}
            className="text-cyan border-cyan/30"
          >
            <ArrowDown size={11} aria-hidden="true" />
            Follow
          </MollyButton>
        )}

        <div className="w-44">
          <MollyInput
            id="log-search"
            aria-label="Search logs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs…"
            inputSize="sm"
          />
        </div>

        <div className="w-36">
          <MollySelect<LogFilter>
            id="log-filter"
            ariaLabel="Filter by level"
            value={filter}
            onChange={setFilter}
            options={LEVEL_OPTIONS}
            size="sm"
          />
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-[11px]"
        role="log"
        aria-label="System log entries"
        style={virtualizerStyle}
      >
        <div className="relative h-(--total-height)">
          <div className="absolute top-0 left-0 right-0 translate-y-(--offset-y)">
            {visibleLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 px-2 hover:bg-mol-secondary transition-colors border-b border-border-subtle/30 h-(--row-height)"
              >
                <span className="text-txt-muted w-20 shrink-0">
                  {l.timestamp}
                </span>
                <span
                  className={`w-12 font-bold uppercase shrink-0 ${COLOR[l.level]}`}
                >
                  {l.level}
                </span>
                <span className="text-violet w-36 truncate shrink-0">
                  {l.node}
                </span>
                <span className="text-txt-secondary flex-1 truncate">
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
