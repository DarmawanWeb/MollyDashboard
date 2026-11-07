import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A column of cards on an operator page. In the wide layout it fills the
 * page height and scrolls on its own; narrow, it stacks with the page.
 */
export function AppSidebar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // cards keep their height; the column scrolls instead
        "flex min-w-0 flex-col gap-3 lg:gap-4 [&>*]:shrink-0",
        "@5xl:min-h-0 @5xl:overflow-y-auto @5xl:pb-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
