# Development

Local setup, the mock robot, and common debugging workflows.

## Prerequisites

- Node.js 22+
- pnpm 10+

Optional (for robot integration):
- the Molly stack with the web bridge (`ros2 launch molly robot.launch.py web:=true`)
- a machine on the robot's network

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# rosbridge_suite WebSocket endpoint
NEXT_PUBLIC_ROSBRIDGE_URL=ws://192.168.1.120:9090

# web_video_server HTTP base
NEXT_PUBLIC_VIDEO_SERVER_URL=http://192.168.1.120:8080

# Mock robot even when rosbridge is reachable. Defaults to true in dev.
NEXT_PUBLIC_USE_MOCKS=false
```

Then:

```bash
pnpm dev
```

Open `http://localhost:3010` (or `PORT=… pnpm dev`) — redirects to `/monitor`. The URLs and the robot namespace can
also be changed in **Settings → Connection** without a rebuild.

## Mock Robot

Two ways to run without a robot:

**1. Explicit flag** — `NEXT_PUBLIC_USE_MOCKS=true` (the default in development). The mock
robot runs regardless of the connection.

**2. Offline fallback** — until rosbridge is connected, every build switches to the
mock robot; once the socket opens, the stores are cleared and live data takes over.

`mocks/mock-robot.ts` implements the whole `RobotApi` on an in-memory robot:

| Area | Simulated |
|---|---|
| Site | two sites, four POIs with narration and gestures, one tour; save / delete POIs and tours |
| Mapping | start / stop / save, scan count and known area growing |
| Localization | localize from a tag, record tags |
| Walking | go-to with a straight path, arrival heading, cancel; walking speed setting |
| Tour | `mocks/tour-runner.ts`: navigating → performing_motion → narrating → dwelling, returning |
| Interaction | speech with duration, stop, gestures, greeter, conversation answers, visitors |
| Control | AUTO / REMOTE, e-stop, teleop moving the robot, stand / sit, gaits |
| Telemetry | battery, IMU, Lite3 state, health, `/rosout`-like logs |

The mock state lives in the page: a full reload starts from the seed again.

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

Lefthook runs on commit (`pnpm prepare` installs it):

```yaml
pre-commit:    biome-check, type-check, git add .
commit-msg:    commitlint --edit
pre-push:      full check
```

Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc).

## Debugging ROS Integration

### Check WebSocket Status

Browser DevTools → Network → WS filter: `ws://<robot>:9090` should be open. The footer
shows `connected` / `reconnecting` / `disconnected` and `mock` while the mock robot runs.

### Watch What the Dashboard Sends

```bash
# On the robot:
ros2 topic echo /bridge/remote_cmd_vel        # drive pad in REMOTE
ros2 topic echo /tour/state                   # tour commands land here
ros2 service call /tour/get_state molly_interfaces/srv/GetTourState
```

For verbose tracing, set a breakpoint in `client.ts` `handleIncoming()`.

### Force Reconnect

Settings → Connection → change a field and **Save & reconnect**. `configureRos()` tears down
the singleton when the URL or namespace changes and the sync hooks re-subscribe.

### Nothing Arrives From the Robot

- rosbridge only exposes the web contract's names (`molly_bridge/config/web_params.yaml`);
  a topic outside it is silently missing.
- Driver topics use the robot namespace: `/robot/battery` with the default `robot`. Check
  Settings → Connection → Robot namespace.

## Adding a New ROS Topic

1. Define the message shape in `src/types/ros/` (or use an existing standard type).
2. Add an entry to `TOPICS` in `src/lib/ros/topics.ts`:
   ```ts
   MY_TOPIC: topic<MyMessage>("/my_topic", "my_pkg/msg/MyMessage"),
   ```
3. Decode it into a store in `hooks/use-ros-sync.ts` (and feed the same store from the mock
   robot in `hooks/use-mock-sync.ts`), then read the store with a selector.

## Adding a Robot Action

1. Add the service to `SERVICES` (types in `types/ros/`).
2. Add the method to `RobotApi` (`types/ui/robot-api.ts`) and implement it in
   `lib/robot/live-api.ts` and `mocks/mock-robot.ts`.
3. Call it from a component with `useRobotAction().run(key, label, () => api.myAction())`.

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
3. Add it to the navigation in `src/constants/tabs.ts`.

## Performance Tips

- Wrap expensive renderers in `useMemo` when inputs are stable (e.g. `bakeGrid` in OccupancyCanvas)
- Use Zustand selectors to subscribe to specific fields — don't destructure the whole store
- Throttle high-frequency topics in the subscribe call:
  ```ts
  ros.subscribe(TOPICS.IMU, handler, { throttleMs: 200 })
  ```

## Troubleshooting

**"Cannot find module '@/lib/ros'"** — restart the TypeScript server in your editor. The path
alias is in `tsconfig.json` but editors cache.

**Map stays empty** — the robot publishes `/map` once a site is loaded (or while mapping).
Load a site on the Mapping page, or check `ros2 topic info /map` on the robot.

**Tour refused** — the robot must be localized and in AUTO; the refusal shows as a toast. If
the state is stuck in `STARTING`, the robot didn't answer within 3 s; check `/tour/control`
on the robot.

**Drive pad disabled** — switch to REMOTE on the Control page and release the e-stop.

**Toast not appearing** — `ToastViewport` is mounted in `DashboardLayout`; toasts called
outside `/(dashboard)/` routes don't render.
