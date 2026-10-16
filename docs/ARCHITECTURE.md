# Architecture

High-level map of the dashboard's modules and how data flows between them.

## Module Tree

```
src/
├── app/                  Next.js App Router routes
│   ├── (dashboard)/
│   │   ├── layout.tsx    AppProviders + chrome + ToastViewport
│   │   ├── monitor/
│   │   ├── mapping/
│   │   ├── system/
│   │   └── settings/
│   ├── globals.css       Tailwind + design tokens + reduced-motion
│   └── layout.tsx        Root HTML, fonts
│
├── components/
│   ├── error/            ErrorBoundary, RouteError
│   ├── feedback/         Toast system, ConnectionBanner
│   ├── layout/           Header, Footer, AppSidebar, AppSection
│   ├── map/              OccupancyCanvas + renderers (pure) + hooks
│   ├── providers/        ConnectionProvider, SimulationLayer, TourController
│   ├── skeleton/         Loading placeholders
│   └── ui/molly/         Industrial form primitives (Button, Field, Input, ...)
│
├── hooks/
│   ├── use-ros.ts                Subscribe helpers + simulation hooks
│   ├── use-ros-map.ts            /map subscription with mock fallback
│   ├── use-telemetry-simulation  Fake battery/temp/IMU when offline
│   └── use-tour-controller       Wire dashboard ↔ robot tour FSM
│
├── lib/
│   ├── env.ts            Typed, validated env (NEXT_PUBLIC_*)
│   ├── ros/              Transport + Client + Topic registry + codecs
│   │   ├── transport.ts  WebSocket lifecycle with reconnect/backoff
│   │   ├── client.ts     Typed pub/sub/service over transport
│   │   ├── topics.ts     TOPICS + SERVICES registry (single source)
│   │   ├── codec.ts      Quaternion ↔ Euler, Twist factory, grid utils
│   │   └── singleton.ts  getRos() + configureRos()
│   ├── tour/             FSM pure logic + wire codec
│   │   ├── fsm.ts        canTransition, nextState (pure)
│   │   └── messages.ts   wire ↔ TS adapters
│   └── utils.ts          cn() (clsx + tailwind-merge)
│
├── mocks/                Synthetic data for offline dev
│   ├── occupancy-grid.ts
│   └── tour-runner.ts
│
├── stores/               Zustand stores, one per domain
│   ├── use-robot-store
│   ├── use-tour-store
│   ├── use-comms-store
│   └── use-settings-store    (persisted to localStorage)
│
└── types/
    ├── ros/              Raw ROS message shapes (mirrors ROS msg definitions)
    └── ui/               UI-side denormalized types
```

## Dependency Rules

```
app/         ← can import anything
components/  ← components, hooks, lib, stores, types
hooks/       ← lib, stores, types, mocks
lib/         ← types only (and other lib/* modules, no cycles)
mocks/       ← lib, types
stores/      ← types
types/       ← nothing (leaves)
```

**Invariant**: `lib/*` never imports from `components/` or `app/`. Types never import from anywhere except other types. This keeps the dependency graph one-way and prevents cycles.

## Provider Tree

```
DashboardLayout
└─ AppProviders
   └─ ConnectionProvider       opens rosbridge, syncs status to store
      └─ SimulationLayer       runs mocks when offline / USE_MOCKS
         └─ TourController     subscribes /tour/state, owns command publish
            └─ {children}      route content
```

Mount order matters because `SimulationLayer` reads `connectionStatus` to decide whether to run, and `TourController` reads from both connection state and the tour store.

## Data Flow: ROS Topic → Component

```
rosbridge WebSocket
  │
  ▼
RosTransport            ← reconnect, parse JSON, fire events
  │
  ▼
RosClient.subscribe(TOPICS.MAP, handler)
  │
  ▼
useOccupancyGrid()      ← React hook wrapping the subscription
  │
  ▼
<OccupancyCanvas grid={grid} />
```

The `TOPICS` registry in `lib/ros/topics.ts` is the single source of truth for topic names + message types. Every `subscribe` / `publish` call site gets full type inference from the registry — no stringly-typed topic names floating around.

## Tour FSM — Robot Authority

```
Dashboard                          Robot (tour_fsm node)
─────────────────                  ───────────────────
TourControl                        tour_fsm.py
  │ click Start                       │
  ▼                                   ▼
useTourController.sendCommand     subscribe /tour/cmd
  │ optimistic STARTING               │
  │ publish /tour/cmd  ──────────────►│ validate transition
  │ arm 3s ack timer                  │ execute (nav2, TTS, motion)
  │                                   │
  │◄──── publish /tour/state ─────────┤ on every state change
  │ reconcile                         │
  │ clear ack timer                   │
  ▼                                   ▼
useTourStore updates              robot keeps cycling activities
  │
  ▼
TourControl re-renders
```

Key idea: **robot owns the state machine, dashboard mirrors it**. Optimistic transitions (`STARTING`, `STOPPING`) give snappy UX during the ack window; real state from `/tour/state` always wins on reconciliation. See `lib/tour/fsm.ts` for the full transition matrix.

When `env.USE_MOCKS` is true or rosbridge is disconnected, `createMockTourRunner()` stands in for the robot — same interface, 300ms simulated latency.

## State Management

Each domain has its own Zustand store; components subscribe to specific slices via selectors:

```tsx
// Only re-renders when battery changes:
const battery = useRobotStore((s) => s.state.battery_percentage);

// Only re-renders when pose changes:
const pose = useRobotStore((s) => s.pose);
```

This is why `pose` lives at the top of the robot store, separate from the rest of `state` — it updates at ~10Hz from `/odom` while the rest updates at ~1Hz. Separating them avoids cascading re-renders for components that only care about one.

## Why This Layout

- **Pure renderers** (`map/renderers/*`) are functions that take `(ctx, params)` — testable without DOM, swappable per-output (canvas now, WebGL later).
- **Topic registry** (`lib/ros/topics.ts`) means renaming `/cmd_vel` → `/molly/cmd_vel` is one line, and TypeScript shows every call site.
- **Mock layer** (`mocks/`, `SimulationLayer`) decouples dev experience from robot availability — dashboard runs fully without ROS for UI work.
- **Provider composition** keeps each side effect (connect, simulate, subscribe FSM) in its own component with a single responsibility.
- **Molly UI primitives** wrap Base UI with design tokens — consistent rendering across all forms, dropdowns that match the dark theme (native `<select>` can't).
