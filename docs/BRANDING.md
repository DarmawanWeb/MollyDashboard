# Branding

Names, credits and logos shown by the visitor display and the operator pages.

## Logos

Drop the companies' **official** logo files into `public/brand/`, named after the slug:

| Company | Light backgrounds | Dark backgrounds (optional) |
|---|---|---|
| Indosat Ooredoo Hutchison | `indosat-ooredoo-hutchison.svg` | `indosat-ooredoo-hutchison-dark.svg` |
| PT Ezra Robotics Teknologi | `ezra-robotics.svg` | `ezra-robotics-dark.svg` |

- `.svg`, `.png`, `.webp` or `.jpg` all work; SVG stays sharp on a TV. A transparent background
  is best.
- The `-dark` file is the version for dark backgrounds (usually a white or light logo). Without
  one, the regular logo sits on a small white plate in dark mode, so colored logos stay legible.
- The height is fixed by the layout and the width follows the file: crop the margins around the
  mark.

The build looks for the files (`src/server/brand.ts`), so rebuild after adding them
(`deploy/deploy.sh` does). Until a file exists, its slot shows the company name.

Use the files the companies provide (their brand teams' kits). Don't redraw or recolor a logo.

## Names and Credits

`src/constants/brand.ts`:

- `robot` — "Molly"
- `tagline` — the subtitle under the name, per language
- `partner` — Indosat Ooredoo Hutchison (host of the experience center)
- `maker` — PT Ezra Robotics Teknologi
- `credits` — "Created by Agus Darmawan · PT Ezra Robotics Teknologi" and the copyright year

The assistant's persona (`src/server/assistant/prompt.ts`) and venue knowledge
(`config/assistant.md`) use the same names.

## Look

Colors are CSS variables with a light and a dark value (`src/app/globals.css`): neutral grays
for the layout, one accent (`--brand`, indigo) for what is active or primary, and the status
colors (green, amber, orange, red) only for status. The one gradient, `--brand` → `--brand-2`,
is Molly's paw mark. The map canvas mirrors the tokens in `src/components/map/palette.ts`.
The display uses Plus Jakarta Sans (self-hosted), the operator pages add JetBrains Mono for
numbers. Labels and titles are sentence case.
