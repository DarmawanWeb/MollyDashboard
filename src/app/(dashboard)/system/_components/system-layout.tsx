"use client";

import { useRobotStore } from "@/stores/use-robot-store";
import LogViewer from "./log-viewer";
import ResourceMonitor from "./resource-monitor";
import ServiceStatusList from "./service-status-list";

export default function SystemLayout() {
  const robotState = useRobotStore((s) => s.state);

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="w-90 shrink-0 border-r border-border-subtle flex flex-col bg-mol-primary overflow-y-auto">
        <ResourceMonitor robotState={robotState} />
        <ServiceStatusList />
      </div>

      <div className="flex-1 min-w-0 flex flex-col bg-mol-root">
        <LogViewer />
      </div>
    </div>
  );
}
