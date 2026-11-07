"use client";

import { Activity, Cpu } from "lucide-react";
import { AppSection } from "@/components/layout/app/section";
import { AppSidebar } from "@/components/layout/app/sidebar";
import LogViewer from "./log-viewer";
import ResourceMonitor from "./resource-monitor";
import ServiceStatusList from "./service-status-list";

/** Robot computer load and health on the left, /rosout on the right. */
export default function SystemLayout() {
  return (
    <div className="@container flex min-h-0 flex-1 flex-col overflow-y-auto @5xl:overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-3 lg:gap-4 lg:p-4 @5xl:min-h-0 @5xl:flex-1 @5xl:grid-cols-[22rem_minmax(0,1fr)] @5xl:grid-rows-[minmax(0,1fr)]">
        <AppSidebar>
          <AppSection title="Resources" icon={<Cpu />}>
            <ResourceMonitor />
          </AppSection>
          <AppSection title="Health & nodes" icon={<Activity />}>
            <ServiceStatusList />
          </AppSection>
        </AppSidebar>

        <section
          aria-label="Logs"
          className="flex h-[70vh] min-h-[24rem] flex-col overflow-hidden rounded-xl border border-border-subtle bg-mol-secondary shadow-card @5xl:h-auto @5xl:min-h-0"
        >
          <LogViewer />
        </section>
      </div>
    </div>
  );
}
