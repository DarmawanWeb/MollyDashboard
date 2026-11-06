import { X } from "lucide-react";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";
import type { BrandLogos } from "@/types";
import { CompanyLogo } from "./company-logo";

/**
 * Both logos side by side: the host (Indosat Ooredoo Hutchison) and the
 * maker (Ezra Robotics), the way co-branded displays show partners.
 */
export function PartnerLockup({
  logos,
  size = "md",
  className,
}: {
  logos: BrandLogos;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const height = { sm: "h-6", md: "h-9", lg: "h-12" }[size];
  const text = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <CompanyLogo
        company={BRAND.partner}
        files={logos.partner}
        className={cn(height, text)}
      />
      <X
        aria-hidden
        className="size-3.5 shrink-0 text-txt-muted"
        strokeWidth={2.5}
      />
      <CompanyLogo
        company={BRAND.maker}
        files={logos.maker}
        fallback="short"
        className={cn(height, text)}
      />
    </div>
  );
}
