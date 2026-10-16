import type { ReactNode } from "react";

export function AppSidebar({
  children,
  side = "right",
  width = "w-[320px]",
}: {
  children: ReactNode;
  side?: "left" | "right";
  width?: string;
}) {
  return (
    <aside
      className={[
        width,
        "shrink-0 flex flex-col overflow-y-auto bg-mol-primary",
        side === "left"
          ? "border-r border-border-subtle"
          : "border-l border-border-subtle",
      ].join(" ")}
    >
      <div className="flex flex-col">{children}</div>
    </aside>
  );
}
