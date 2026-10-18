# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow `version` in
`package.json`.

## [Unreleased]

### Changed
- Navigation, site, POI, mapping, path finder and visitor types are `dharma_interfaces` (Molly
  1.0.0 runs on the Dharma packages); tour and speech types stay `molly_interfaces`.

### Docs
- README: CI badge, configuration table for the `NEXT_PUBLIC_*` variables, link to this
  changelog.
- Docs checked against the code: scripts, env vars, `src/` layout and the rosbridge names in
  `src/lib/ros/topics.ts` match Molly's `docs/web.md`.

## [0.1.0]

- First version: monitor, control, mapping with POI and tour editors, system and settings
  pages over rosbridge, with an in-memory mock robot.
