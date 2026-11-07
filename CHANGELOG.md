# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow `version` in
`package.json`.

## [Unreleased]

### Added
- Visitor display at `/` for the Indosat Ooredoo Hutchison experience center: live camera with
  what Molly is doing and live captions, floor plan with the stops and visitors, tour journey,
  today's numbers (visitors, questions, tours, distance, battery) and Ask Molly, in Bahasa
  Indonesia and English. Scales with the screen, stacks on tablets and phones, shows a resting
  state when the robot is offline and runs a demo autopilot on `USE_MOCKS` builds.
- Light and dark mode on every page (toggle in the headers, Light / Dark / System in Settings),
  without a flash on load; the map canvas follows.
- Ask Molly LLM gateway (`/api/chat`): any OpenAI-compatible API (`LLM_API_URL`, `LLM_API_KEY`,
  `LLM_MODEL`), called by the server with Molly's persona, the venue knowledge in
  `config/assistant.md` and the live robot context in the prompt; streamed answers, spoken by
  the robot, `<think>` reasoning hidden, rate limited.
- Shared conversation history (`/api/conversations`, `$DATA_DIR/conversations.jsonl`): every
  screen sees the same questions, including those asked to the robot in person; history drawer
  with search on the display, export and clear in Settings.
- Indosat Ooredoo Hutchison and Ezra Robotics logo slots (`public/brand/`, docs/BRANDING.md)
  and credits in the footers.
- Settings: AI Assistant (answer engine, spoken answers, history) and Appearance sections.
- One frame for every page: a sidebar (Showcase, Monitor, Mapping, System, Settings; Molly's
  status) that collapses to icons (Ctrl/⌘ B) and opens as a drawer on phones, and
  one top bar in the same place on every page. Pages fade in; nothing else reloads.
- Presentation mode for the TV: no operator chrome, full screen, scaled to the screen, idle
  pointer hidden; leave with Esc or by holding the exit button; `?present=1` for kiosks.

### Changed
- Navigation, site, POI, mapping, path finder and visitor types are `dharma_interfaces` (Molly
  1.0.0 runs on the Dharma packages); tour and speech types stay `molly_interfaces`.
- `/` is the visitor display (it redirected to `/monitor`).
- Operator pages as cards in responsive grids (container queries); settings, toasts, stats,
  resource bars and the connection notice restyled.
- New look: Plus Jakarta Sans, rounded cards and controls, light / dark design tokens.
- Cleaner look: neutral grays with one indigo accent instead of cyan and violet, no gradients,
  glows or tinted icon tiles (only Molly's paw mark keeps one), sentence-case labels, quieter
  pills and badges, thinner progress bars, and a plain floor plan on the map.
- The sidebar no longer repeats the partner names (the display's top bar shows the logos), and
  the top bar shows Molly's name only where the sidebar does not.
- The demo robot's floor plan is an exhibition hall with an entrance, partitions and stands
  (no random noise), laid out so the demo tour never walks through a wall; its visitors stand
  at the exhibits instead of following the robot.
- The demo robot's POIs have descriptions and it gives short canned answers.

### Fixed
- Switching pages no longer restarts the tour, the robot connection or the chat: the providers
  live in one shared layout, and every `useTourController()` drives the same tour instead of
  creating its own mock runner.

### Removed
- The Control page (drive pad, AUTO / REMOTE, stand / sit, gaits), teleop and its settings:
  the handheld remote drives the robot.

### Docs
- README rewritten for the display and the gateway; docs/ASSISTANT.md and docs/BRANDING.md.
- README: CI badge, configuration table for the `NEXT_PUBLIC_*` variables, link to this
  changelog.
- Docs checked against the code: scripts, env vars, `src/` layout and the rosbridge names in
  `src/lib/ros/topics.ts` match Molly's `docs/web.md`.

## [0.1.0]

- First version: monitor, control, mapping with POI and tour editors, system and settings
  pages over rosbridge, with an in-memory mock robot.
