import { Server } from "lucide-react";

const MOCK_SERVICES = [
  {
    name: "rosbridge_suite",
    node: "/rosbridge_websocket",
    status: "running",
    pid: 1842,
    cpu: 3.2,
    mem: 128,
  },
  {
    name: "nav2_bringup",
    node: "/bt_navigator",
    status: "running",
    pid: 2156,
    cpu: 12.4,
    mem: 256,
  },
  {
    name: "slam_toolbox",
    node: "/slam_toolbox_node",
    status: "stopped",
    pid: null,
    cpu: 0,
    mem: 0,
  },
];

export default function ServiceStatusList() {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Server size={14} />
        <span className="label text-xs">Service Status</span>
      </div>

      <div className="flex flex-col gap-1">
        {MOCK_SERVICES.map((svc) => {
          const dot =
            svc.status === "running"
              ? "bg-green"
              : svc.status === "error"
                ? "bg-red"
                : "bg-txt-muted";

          return (
            <div
              key={svc.name}
              className="panel-inset px-3 py-2 flex justify-between"
            >
              <div className="flex gap-2">
                <div className={`w-2 h-2 ${dot}`} />
                <div>
                  <div className="text-xs">{svc.name}</div>
                  <div className="text-[10px] text-txt-muted">{svc.node}</div>
                </div>
              </div>

              <div className="text-right text-[10px]">
                <div className="font-bold uppercase">{svc.status}</div>
                {svc.pid && (
                  <div className="text-txt-muted">
                    PID {svc.pid} · {svc.cpu}% · {svc.mem}MB
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
