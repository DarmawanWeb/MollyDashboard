import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

/** Molly's mark: the paw on the brand gradient (the one gradient left). */
export function MollyMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-gradient-brand text-on-brand",
        className,
      )}
    >
      <PawPrint className="size-[55%]" />
    </span>
  );
}
