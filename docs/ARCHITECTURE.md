# Architecture

High-level map of the dashboard's modules and how data flows between them.

## Module Tree

```
src/
├── app/                      Next.js App Router routes
│   ├── (dashboard)/
│   │   ├── layout.tsx        AppProviders + chrome + ToastViewport
│   │   ├── monitor/          tour, walk-to, speech, visitors, conversation
│   │   ├── control/          AUTO / REMOTE, drive pad, robot actions
│   │   ├── mapping/          sites, mapping, localization, POI + tour editors
│   │   ├── system/           health, nodes, /rosout logs
│   │   └── settings/         connection, camera, motion, interaction
│   ├── globals.css           Tailwind + design tokens + reduced-motion
│   └── layout.tsx            Root HTML, self-hosted fonts
│
├── components/
│   ├── error/                ErrorBoundary, RouteError
│   ├── feedback/             Toast viewport, ConnectionBanner
│   ├── layout/               Header (tabs, e-stop), Footer, AppSidebar, AppSection
│   ├── map/                  OccupancyCanvas, RobotMap + renderers (pure) + hooks
│   ├── providers/            Connection, Simulation, RosSync, TourController
│   ├── robot/                ActivityBadge, CameraFeed, Stat
│   ├── skeleton/             Loading placeholders
│   └── ui/molly/             Industrial form primitives (Button, ConfirmButton, Field, …)
│
├── constants/                Tabs, activity styles, gestures, robot actions
│
├── hooks/
│   ├── use-robot-api         RobotApi for the current mode (live or mock)
│   ├── use-robot-action      run an action from a button: busy key + error toast
│   ├── use-ros-sync          robot topics → domain stores (live)
│   ├── use-mock-sync         mock robot → domain stores (offline)
│   ├── use-tour-controller   tour commands + optimistic FSM
│   ├── use-teleop            hold-to-drive on /bridge/remote_cmd_vel
│   ├── use-ros-map           /map with the mock grid offline
│   ├── use-hydrated          false while server HTML hydrates
│   ├── use-draft             local edit of a stored value
│   └── …                     mock mode, activity, video URL, hold-to-confirm
│
├── lib/
│   ├── env.ts                Typed, validated env (NEXT_PUBLIC_*)
│   ├── ros/                  Transport + client + registry + codecs
│   │   ├── transport.ts      WebSocket lifecycle with reconnect/backoff
│   │   ├── client.ts         Typed pub/sub/service, resolves `{robot}`
│   │   ├── topics.ts         TOPICS + SERVICES registry (single source)
│   │   ├── names.ts          robot namespace placeholder
│   │   ├── params.ts         rcl_interfaces parameter helpers
│   │   ├── codec.ts          Quaternion ↔ Euler, Twist factory, grid utils
│   │   └── singleton.ts      getRos() + configureRos()
│   ├── robot/                Lite3 / control codecs, activity, live RobotApi
│   ├── site/                 POI, tour, site and mapping codecs, ids
│   ├── navigation/           planner, follower and path codecs
│   ├── interaction/          speech, greeter, conversation, visitors
│   ├── system/               health JSON, /rosout entries
│   ├── tour/                 FSM pure logic + wire codec
│   ├── map/                  frame helpers (base_link → map)
│   └── utils.ts              cn() (clsx + tailwind-merge)
│
├── mocks/                    In-memory robot for offline use
│   ├── mock-robot.ts         RobotApi + simulated state (walk, speech, visitors…)
│   ├── tour-runner.ts        guide FSM: navigating → narrating → dwelling
│   └── occupancy-grid.ts     synthetic floor plan
│
├── stores/                   Zustand stores, one per domain
│   ├── use-robot-store       connection, pose, localization, battery, Lite3, control
│   ├── use-site-store        site, mapping, POIs, tours
│   ├── use-navigation-store  planner, path, follower
│   ├── use-interaction-store speech, greeter, conversation, visitors
│   ├── use-system-store      health, logs
│   ├── use-tour-store        tour state mirror
│   ├── use-toast-store       toasts
│   └── use-settings-store    (persisted to localStorage, versioned)
│
└── types/
    ├── ros/                  Wire shapes (molly_interfaces, lite3_interfaces, std, rcl, …)
    └── ui/                   UI-side types, RobotApi contract
```

## Dependency Rules

```
app/         ← can import anything
components/  ← components, constants, hooks, lib, stores, types
hooks/       ← lib, stores, types, mocks
lib/         ← types only (and other lib/* modules, no cycles)
mocks/       ← lib, types
stores/      ← types
constants/   ← types
types/       ← nothing (leaves)
```

**Invariant**: `lib/*` never imports from `components/` or `app/`. Types never import from
anywhere except other types. This keeps the dependency graph one-way and prevents cycles.

## Provider Tree

```
DashboardLayout
└─ AppProviders
   └─ ConnectionProvider       opens rosbridge with the saved URL + namespace
      └─ SimulationLayer       mock robot → stores while offline / USE_MOCKS
         └─ RosSyncLayer       robot topics → stores while connected
            └─ TourController  /tour/state + /tour/get_state, tour commands
               └─ {children}   route content
```

Mock mode is `env.USE_MOCKS || connection === "disconnected"`. The two sync layers are
mutually exclusive: leaving mock mode clears every store so no mock value lingers next to
live data. `ConnectionProvider` waits for hydration (`useHydrated`) so it connects with the
saved settings instead of the build defaults.

## Data Flow: ROS Topic → Component

```
rosbridge WebSocket
  │
  ▼
RosTransport            ← reconnect, parse JSON, fire events
  │
  ▼
RosClient.subscribe(TOPICS.SITE_POIS, handler)     `{robot}` resolved here
  │
  ▼
useRosSync              ← decode at the boundary (lib/site/codec.ts)
  │
  ▼
useSiteStore.setPois()
  │
  ▼
<RobotMap /> <POIList /> <TourControl />            selectors, no ROS types
```

The `TOPICS` / `SERVICES` registry in `lib/ros/topics.ts` is the single source of truth for
names and message types. Every `subscribe` / `publish` / `callService` gets full type
inference from it. Driver names use a `{robot}` placeholder (`/{robot}/battery`) that the
client resolves with the namespace from Settings.

## Robot API: Live or Mock

Components never call ROS services directly. They get a `RobotApi` (`types/ui/robot-api.ts`)
from `useRobotApi()`:

```
useRobotApi()
  ├─ live: lib/robot/live-api.ts   service calls over rosbridge, decoded answers
  └─ mock: mocks/mock-robot.ts     the same contract on an in-memory robot
```

Every action resolves to `{ success, message }` (a failed or timed-out call too), so
`useRobotAction` turns it into a busy state and an error toast in one place. The mock robot
walks to goals, runs speech and gestures, tracks visitors, grows the map while mapping and
stores POIs and tours, so every page works offline.

## Tour FSM — Robot Authority

```
Dashboard                              Robot (guide node)
─────────────────                      ──────────────────
TourControl
  │ click Start
  ▼
useTourController.sendCommand
  │ optimistic STARTING
  │ call /tour/control  ──────────────► validate, answer success / refusal
  │ arm 3s ack timer                    execute: navigating → performing_motion
  │                                     → narrating → dwelling → … → returning
  │◄──── publish /tour/state ──────────┤ on every change
  │ reconcile, clear ack timer
  ▼
useTourStore → TourControl, RobotMap, ActivityBadge
```

The robot owns the state machine; the dashboard mirrors it. Optimistic transitions
(`STARTING`, `STOPPING`) give snappy feedback during the ack window; `/tour/state` always
wins. A refusal in the service answer becomes a toast; if `/tour/control` is unreachable
the command is published on `/tour/cmd`. `/tour/get_state` fills the state on (re)connect.
Offline, `createMockTourRunner()` plays the guide against the mock robot's site.

## State Management

Each domain has its own Zustand store; components subscribe to slices via selectors:

```tsx
// Only re-renders when the pose changes:
const pose = useRobotStore((s) => s.pose);

// Only re-renders when the e-stop flips:
const engaged = useRobotStore((s) => s.control.estopEngaged);
```

Store setters are read with `getState()` inside the sync hooks, so syncing never
re-renders. High-rate topics are throttled at subscribe time (pose 100 ms, IMU 200 ms) and
`/rosout` is batched every 250 ms.

Settings are persisted and versioned (`migrate` keeps the URLs of older versions). Stores
render their initial state while the server HTML hydrates, so values that seed local state
go through `useDraft` (shows the stored value until the user edits) instead of
`useState(stored)`.

## Why This Layout

- **Pure renderers** (`map/renderers/*`) are functions of `(ctx, params)`: path, goal,
  POIs with headings, visitors, tour route, placement preview — testable without DOM.
- **Topic registry** (`lib/ros/topics.ts`) means renaming a topic is one line, and
  TypeScript shows every call site.
- **RobotApi + mock robot** decouple the UI from robot availability — every page runs
  without ROS.
- **Provider composition** keeps each side effect (connect, simulate, sync, tour) in its
  own component with a single responsibility.
- **Molly UI primitives** wrap Base UI with design tokens — consistent rendering across all
  forms, dropdowns that match the dark theme (native `<select>` can't).
