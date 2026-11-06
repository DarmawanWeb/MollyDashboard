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

### Changed
- Navigation, site, POI, mapping, path finder and visitor types are `dharma_interfaces` (Molly
  1.0.0 runs on the Dharma packages); tour and speech types stay `molly_interfaces`.
- `/` is the visitor display (it redirected to `/monitor`); the operator pages have a new header
  with the logos, pill tabs, a Display button and the theme toggle.
- New look: Plus Jakarta Sans, rounded cards and controls, light / dark design tokens.
- The demo robot's POIs have descriptions and it gives short canned answers.

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
