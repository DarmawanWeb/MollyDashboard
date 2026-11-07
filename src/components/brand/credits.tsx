import { Heart } from "lucide-react";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

/** "Created by Agus Darmawan · PT Ezra Robotics Teknologi" */
export function Credits({
  language = "en",
  className,
}: {
  language?: "id" | "en";
  className?: string;
}) {
  const { author, company } = BRAND.credits;
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-1.5",
        className,
      )}
    >
      {language === "id" ? "Dibuat dengan" : "Crafted with"}
      <Heart
        aria-label="love"
        className="size-[1em] shrink-0 fill-red text-red"
      />
      {language === "id" ? "oleh" : "by"}
      <span className="font-medium text-txt-secondary">{author}</span>
      <span aria-hidden className="text-txt-muted">
        ·
      </span>
      <span className="font-medium text-txt-secondary">{company}</span>
    </span>
  );
}

/** "© 2026 Indosat Ooredoo Hutchison × Ezra Robotics" */
export function Copyright({ className }: { className?: string }) {
  return (
    <span className={className}>
      © {BRAND.credits.year} {BRAND.partner.name} × {BRAND.maker.short}
    </span>
  );
}
