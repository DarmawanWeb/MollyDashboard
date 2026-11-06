/**
 * Who Molly is, who made her and where she works: names, credits and the
 * logo file names used by the display and the operator chrome.
 *
 * Logos are the companies' official files in public/brand/, named after the
 * slug (`<slug>.svg|png|webp`, plus an optional `<slug>-dark.*` for dark
 * backgrounds); see docs/BRANDING.md. The build picks up whatever is there
 * (server/brand.ts). Without a file the slot shows the company name.
 */

export interface Company {
  /** Full name, also the logo's alt text and fallback */
  name: string;
  /** Short form for tight spots */
  short: string;
  /** Logo file name in public/brand/ without the extension */
  slug: string;
}

export const BRAND = {
  robot: "Molly",
  tagline: {
    id: "Robot Pemandu Berbasis AI",
    en: "AI Tour Guide Robot",
  },
  /** Hosts the experience center */
  partner: {
    name: "Indosat Ooredoo Hutchison",
    short: "IOH",
    slug: "indosat-ooredoo-hutchison",
  },
  /** Builds and runs Molly */
  maker: {
    name: "PT Ezra Robotics Teknologi",
    short: "Ezra Robotics",
    slug: "ezra-robotics",
  },
  credits: {
    author: "Agus Darmawan",
    company: "PT Ezra Robotics Teknologi",
    year: 2026,
  },
} as const satisfies {
  robot: string;
  tagline: { id: string; en: string };
  partner: Company;
  maker: Company;
  credits: { author: string; company: string; year: number };
};
