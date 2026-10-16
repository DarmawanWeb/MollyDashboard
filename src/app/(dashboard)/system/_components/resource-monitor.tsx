import { Cpu, Thermometer } from "lucide-react";
import type { RobotState } from "@/types";
import ResourceBar from "./resource-bar";

export default function ResourceMonitor({
  robotState,
}: {
  robotState: RobotState;
}) {
  return (
    <div className="p-3 border-b border-border-subtle">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={14} />
        <span className="label text-xs">Resource Monitor</span>
      </div>

      <ResourceBar
        label="CPU"
        value={robotState.cpu_usage}
        max={100}
        unit="%"
        color="#22d3ee"
      />
      <ResourceBar
        label="GPU"
        value={robotState.gpu_usage}
        max={100}
        unit="%"
        color="#8b5cf6"
      />
      <ResourceBar
        label="RAM"
        value={robotState.ram_used_gb}
        max={robotState.ram_total_gb}
        unit=" GB"
        color="#f59e0b"
      />

      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <div className="panel-inset px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer size={11} />
            <span className="label">CPU Temp</span>
          </div>
          <span
            className={
              robotState.cpu_temp > 70 ? "text-red" : "text-txt-secondary"
            }
          >
            {robotState.cpu_temp}°C
          </span>
        </div>

        <div className="panel-inset px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer size={11} />
            <span className="label">GPU Temp</span>
          </div>
          <span
            className={
              robotState.gpu_temp > 70 ? "text-red" : "text-txt-secondary"
            }
          >
            {robotState.gpu_temp}°C
          </span>
        </div>
      </div>
    </div>
  );
}
