import Image from "next/image";
import type { Company } from "@/constants/brand";
import { cn } from "@/lib/utils";
import type { LogoFiles } from "@/types";

interface Props {
  company: Company;
  files: LogoFiles;
  /** Sets the logo height (e.g. "h-8"); the width follows the file. */
  className?: string;
  /** Text shown while no logo file exists */
  fallback?: "name" | "short";
}

/**
 * A company's official logo from public/brand/, right for the theme:
 * the `-dark` file on dark backgrounds when there is one, otherwise the
 * regular file on a white plate. Without any file it shows the name, so the
 * layout holds until the files are added (docs/BRANDING.md).
 */
export function CompanyLogo({
  company,
  files,
  className,
  fallback = "name",
}: Props) {
  const { light, dark } = files;

  if (!light && !dark) {
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap font-semibold leading-none tracking-tight text-txt-primary",
          className,
        )}
        title={company.name}
      >
        {fallback === "short" ? company.short : company.name}
      </span>
    );
  }

  const image = (src: string, extra?: string) => (
    <Image
      src={src}
      alt={company.name}
      width={320}
      height={96}
      unoptimized
      priority
      className={cn("h-full w-auto max-w-none object-contain", extra)}
    />
  );

  if (light && dark) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {image(light, "dark:hidden")}
        {image(dark, "hidden dark:block")}
      </span>
    );
  }

  // One file only: put it on a plate where it would not read well.
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg",
        light
          ? "dark:bg-logo-plate dark:px-2 dark:py-1"
          : "bg-[#0b1324] px-2 py-1 dark:bg-transparent dark:p-0",
        className,
      )}
    >
      {image((light ?? dark) as string)}
    </span>
  );
}
