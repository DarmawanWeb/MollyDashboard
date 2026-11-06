/**
 * Which official logo files are in public/brand/. Evaluated on the server
 * (at build time for the static pages), so the browser never requests a
 * logo that is not there.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { BRAND } from "@/constants/brand";
import type { BrandLogos, LogoFiles } from "@/types/ui";

const EXTENSIONS = ["svg", "png", "webp", "jpg"] as const;

function find(file: string): string | undefined {
  for (const ext of EXTENSIONS) {
    const url = `/brand/${file}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", url))) return url;
  }
  return undefined;
}

function logosOf(slug: string): LogoFiles {
  return { light: find(slug), dark: find(`${slug}-dark`) };
}

export function getBrandLogos(): BrandLogos {
  return {
    partner: logosOf(BRAND.partner.slug),
    maker: logosOf(BRAND.maker.slug),
  };
}
