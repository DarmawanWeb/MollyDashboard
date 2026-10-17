# Molly Dashboard

[![CI](https://github.com/DarmawanWeb/mollydashboard/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/DarmawanWeb/mollydashboard/actions/workflows/ci.yml)

Operator console for **Molly**, the tour-guide robot built on a **Deep Robotics Lite3**
(Jetson Orin NX, ROS 2 Humble). Built with Next.js 16, React 19 and Tailwind v4.

The robot side is [DarmawanRobotics/Molly](https://github.com/DarmawanRobotics/Molly)
(navigation, mapping, AprilTag localization, tours, speech and the web bridge), driven by
[lite3_ros2](https://github.com/DarmawanRobotics/lite3_ros2). The handheld remote is
[MollyController](https://github.com/DarmawanRobotics/MollyController).

```
┌────────────────────────────────────────────────┐
│  Dashboard (this repo)                         │
│  ├─ /monitor    tour, walk-to, speech, visitors│
│  ├─ /control    AUTO / REMOTE, drive, posture  │
│  ├─ /mapping    sites, map, tags, POIs, tours  │
│  ├─ /system     health, nodes, /rosout logs    │
│  └─ /settings   robot, camera, motion, speech  │
└───────────────┬────────────────────────────────┘
                │  rosbridge  ws://<robot>:9090
                │  web_video_server  http://<robot>:8080
┌───────────────▼────────────────────────────────┐
│  Robot: molly robot.launch.py web:=true        │
│  site manager · mapping · tag localization ·   │
│  planner + path follower · guide · speech ·    │
│  conversation · visitors · control mux · Lite3 │
└────────────────────────────────────────────────┘
```

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # robot address, camera server, mock flag
pnpm dev                     # http://localhost:3000
```

No robot around? Development builds run against an in-memory mock robot (map, POIs,
tours, walking, speech, visitors, telemetry), and every build falls back to it while
rosbridge is disconnected. Set `NEXT_PUBLIC_USE_MOCKS=false` to talk to a robot in dev.

On the robot, start the stack with the web bridge:

```bash
ros2 launch molly robot.launch.py web:=true
```

The robot address, camera server and the driver namespace (`robot` by default, e.g.
`/robot/battery`) can be changed at runtime in **Settings**; they are saved in the browser.

## Configuration

Build-time defaults from `.env.example` (all `NEXT_PUBLIC_*`, read in `src/lib/env.ts`):

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_ROSBRIDGE_URL` | `ws://localhost:9090` | rosbridge WebSocket, `ws://` or `wss://` |
| `NEXT_PUBLIC_VIDEO_SERVER_URL` | `http://localhost:8080` | web_video_server base |
| `NEXT_PUBLIC_USE_MOCKS` | `true` in dev, `false` in production | force the mock robot |

## Routes

| Route | Purpose |
|---|---|
| `/monitor` | Camera, robot status, map with the path and visitors, tour control, walk to a POI, speech, greeter and gestures, conversation |
| `/control` | AUTO / REMOTE, hold-to-drive pad (and WASD / QE / arrows), stand / sit, gaits |
| `/mapping` | Load a site, record a map, localize and record AprilTags, place POIs on the map (drag for the heading), edit tours |
| `/system` | Health (CPU / GPU / RAM / temperature, topic rates, issues), ROS nodes, `/rosout` log viewer |
| `/settings` | rosbridge / camera URLs, robot namespace, camera stream, walking speed, teleop limits, speech defaults and quick phrases |

The software e-stop sits in the header on every page: one press engages it, releasing
needs a one-second hold.

## Robot Contract

Every topic and service the dashboard uses is listed in Molly's
[docs/web.md](https://github.com/DarmawanRobotics/Molly/blob/main/docs/web.md) and mirrored
in `src/lib/ros/topics.ts`. [docs/ROBOT-SIDE.md](docs/ROBOT-SIDE.md) summarizes it.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — module layout, data flow, robot API, tour FSM
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — local setup, mock robot, debugging
- **[docs/ROBOT-SIDE.md](docs/ROBOT-SIDE.md)** — what the robot has to run and expose
- **[CHANGELOG.md](CHANGELOG.md)** — notable changes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Styling | Tailwind v4 with `@theme` design tokens, self-hosted JetBrains Mono / IBM Plex Sans |
| UI primitives | Base UI (`@base-ui/react`) wrapped as Molly components |
| State | Zustand (one store per domain) |
| ROS integration | Custom `RosClient` over rosbridge_suite WebSocket, typed topic registry |
| Lint + format | Biome 2 |
| Git hooks | Lefthook + commitlint |

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # biome check
pnpm lint:fix     # biome check + auto-fix
pnpm type-check   # tsc --noEmit
pnpm check        # lint + type-check + build (CI mirror)
```

## License

Apache License 2.0, see [LICENSE](LICENSE).
