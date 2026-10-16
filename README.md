# Molly Dashboard

Operator console for the **Molly** tour-guide robot (Unitree Lite3 Venture, ROS 2 Humble). Built with Next.js 16, React 19, and Tailwind v4.

```
┌─────────────────────────────────────┐
│  Dashboard (this repo)              │
│  ┌─ /monitor    live feed + tour    │
│  ├─ /mapping    SLAM + POI editor   │
│  ├─ /system     logs + resources    │
│  └─ /settings   teleop + connection │
└──────────────┬──────────────────────┘
               │  rosbridge_suite (WebSocket)
               ▼
┌─────────────────────────────────────┐
│  Robot (Jetson Orin NX)             │
│  nav2, slam_toolbox, tour_fsm,      │
│  unitree_*, etc.                    │
└─────────────────────────────────────┘
```

## Quick Start

```bash
pnpm install
cp .env.example .env  # then edit ROSBRIDGE_URL
pnpm dev              # http://localhost:3000
```

Robot offline? Set `NEXT_PUBLIC_USE_MOCKS=true` — dashboard runs against synthetic data.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — module layout, data flow, FSM design
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — local setup, mocks, debugging
- **[docs/ROBOT-SIDE.md](docs/ROBOT-SIDE.md)** — what the ROS workspace needs

## Routes

| Route | Purpose |
|---|---|
| `/monitor` | Live camera, tour control, robot status, LLM conversation |
| `/mapping` | SLAM run + save, POI placement + editing |
| `/system` | Resource monitor, ROS node status, log viewer |
| `/settings` | Teleop, connection URLs, Nav2 params, LLM config |

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind v4 with `@theme` design tokens |
| UI primitives | Base UI (`@base-ui/react`) wrapped as Molly components |
| State | Zustand (one store per domain) |
| ROS integration | Custom `RosClient` over rosbridge_suite WebSocket |
| Lint + format | Biome 2 |
| Git hooks | Lefthook |

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # biome check
pnpm lint:fix     # biome check + auto-fix
pnpm type-check   # tsc --noEmit
pnpm check        # lint + type-check + build (CI mirror)
```

## License

MIT
