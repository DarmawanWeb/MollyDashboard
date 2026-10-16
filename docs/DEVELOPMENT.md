# Development

Local setup, mock mode, and common debugging workflows.

## Prerequisites

- Node.js 22+
- pnpm 10+

Optional (for robot integration):
- A reachable rosbridge_suite endpoint
- web_video_server for camera streams

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env`:

```bash
# rosbridge_suite WebSocket endpoint
NEXT_PUBLIC_ROSBRIDGE_URL=ws://192.168.1.120:9090

# web_video_server HTTP base
NEXT_PUBLIC_VIDEO_SERVER_URL=http://192.168.1.120:8080

# Use synthetic data instead of real ROS topics. Defaults to true in dev.
NEXT_PUBLIC_USE_MOCKS=true
```

Then:

```bash
pnpm dev
```

Open `http://localhost:3000` — auto-redirects to `/monitor`.

## Mock Mode

Two ways to run without a robot:

**1. Explicit flag** — `NEXT_PUBLIC_USE_MOCKS=true` in `.env`.

Mocks always run, regardless of connection state. Useful for UI work.

**2. Disconnected fallback** — connection to rosbridge times out → mocks auto-engage.

`SimulationLayer` reads `connectionStatus` and toggles simulators when state is `disconnected`. Switch back to real data by setting a reachable URL in Settings.

### What's mocked

| Hook / Module | Source |
|---|---|
| `useOccupancyGrid` | `mocks/occupancy-grid.ts` — 6m × 5m synthetic floor plan |
| `useRobotSimulation` | random walk in meter coords with bounds reflection |
| `useTelemetrySimulation` | battery, CPU/GPU temp, IMU jitter |
| `useFSMSimulation` | cycles FSM state every 8s |
| `useTourController` | `mocks/tour-runner.ts` — full FSM with 300ms latency |

The mock occupancy grid is sized to match the default robot pose `(0, 0)` so the robot is visible without manual panning.

## Common Commands

```bash
pnpm dev          # Next.js dev server with Turbopack
pnpm build        # production build
pnpm start        # serve production build

pnpm lint         # biome check (no fixes)
pnpm lint:fix     # biome check --write
pnpm format       # biome format --write
pnpm type-check   # tsc --noEmit
pnpm check        # lint + type-check + build (CI mirror)
```

## Git Hooks

Lefthook runs on commit:

```yaml
pre-commit:    biome-check, type-check, git add .
commit-msg:    commitlint --edit
pre-push:      full check
```

Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc).

## Debugging ROS Integration

### Check WebSocket Status

Open browser DevTools → Network → WS filter. Look for `ws://your-host:9090` — green means open. The dashboard's footer also shows `connected` / `reconnecting` / `disconnected`.

### Inspect Subscribed Topics

In the browser console:

```js
// Module-level singleton is reachable from window in dev
const ros = (await import('/src/lib/ros/index.ts')).getRos();
ros.getStatus(); // 'connected' | etc
```

For verbose tracing, set a breakpoint in `client.ts` `handleIncoming()`.

### Force Reconnect

Settings → Connection → change URL (or just save the same URL). Triggers `configureRos({ url })` which tears down the singleton and rebuilds with new config.

### Test Without Robot — Use rosbridge from CLI

If you have a robot reachable but want to verify the dashboard receives a specific message:

```bash
# On robot (or any machine in the ROS graph):
ros2 topic pub /tour/state molly_msgs/msg/TourState "{
  header: {stamp: {sec: 0, nanosec: 0}, frame_id: ''},
  state: 2,
  current_poi_index: 1,
  total_pois: 5,
  current_poi_id: 'lobby',
  activity: 'narrating',
  error_reason: ''
}" --once
```

Dashboard should show "Running" with active POI "lobby".

## Adding a New ROS Topic

1. Define the message shape in `src/types/ros/` (or use existing if it's a standard ROS type).
2. Add an entry to `TOPICS` in `src/lib/ros/topics.ts`:
   ```ts
   MY_TOPIC: topic<MyMessage>("/my_topic", "my_pkg/msg/MyMessage"),
   ```
3. Subscribe in a component:
   ```ts
   const data = useRosTopic(TOPICS.MY_TOPIC, defaultValue);
   ```

TypeScript will infer `data` as `MyMessage`.

## Adding a New Page

1. Create `src/app/(dashboard)/<name>/page.tsx`
2. Create `src/app/(dashboard)/<name>/error.tsx`:
   ```tsx
   "use client";
   import { RouteError } from "@/components/error";
   export default function NameError(props: { error: Error; reset: () => void }) {
     return <RouteError {...props} route="Name" />;
   }
   ```
3. Add to navigation in `src/constants/tabs.ts`.

## Performance Tips

- Wrap expensive renderers in `useMemo` when inputs are stable (e.g. `bakeGrid` in OccupancyCanvas)
- Use Zustand selectors to subscribe to specific fields — don't destructure the whole store
- For high-frequency topics (>10Hz), throttle in the subscribe call:
  ```ts
  ros.subscribe(TOPICS.ODOM, handler, { throttleMs: 100 })
  ```

## Troubleshooting

**"Cannot find module '@/lib/ros'"** — restart TypeScript server in your editor. Path alias is in `tsconfig.json` but editor caches.

**"useOccupancyGrid returned null"** — either rosbridge not connected, or `/map` topic not being published by robot. Set `USE_MOCKS=true` to verify the rendering pipeline works.

**Tour button disabled even though robot is ready** — check the FSM state in the status row. Buttons enable per `canTransition()` rules; if state is stuck in `STARTING`, robot didn't acknowledge within 3s. Real robot needs to publish a `/tour/state` echo for the dashboard to reconcile.

**Toast not appearing** — `ToastViewport` is mounted in `DashboardLayout`. Confirm you're calling `toast.x()` from a route under `/(dashboard)/`. Toasts called from outside the dashboard layout (e.g. root layout) won't render.

**Map shows empty grid pattern** — that's `CanvasSkeleton`. Means `grid` prop is `null`. Either:
  - rosbridge is connecting (wait a few seconds), or
  - `useOccupancyGrid(useMock=false)` was called but you're offline (pass `useMock=true` when disconnected)
