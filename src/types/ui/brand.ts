/** Logo files found in public/brand/ for one company (URL paths). */
export interface LogoFiles {
  /** For light backgrounds */
  light?: string;
  /** For dark backgrounds */
  dark?: string;
}

/** Logos of the partner (host) and the maker, as found at build time. */
export interface BrandLogos {
  partner: LogoFiles;
  maker: LogoFiles;
}
