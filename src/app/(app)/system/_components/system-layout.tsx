"use client";

import LogViewer from "./log-viewer";
import ResourceMonitor from "./resource-monitor";
import ServiceStatusList from "./service-status-list";

export default function SystemLayout() {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="w-90 shrink-0 border-r border-border-subtle flex flex-col bg-mol-primary overflow-y-auto">
        <ResourceMonitor />
        <ServiceStatusList />
      </div>

      <div className="flex-1 min-w-0 flex flex-col bg-mol-root">
        <LogViewer />
      </div>
    </div>
  );
}
