# Architecture

High-level map of the dashboard's modules and how data flows between them.

## Module Tree

```
src/
├── app/                      Next.js App Router routes
│   ├── (app)/                every page, in one shell
│   │   ├── layout.tsx        AppShell: providers, sidebar, top bar, footer, toasts
│   │   ├── page.tsx          `/`: the visitor display (Showcase)
│   │   ├── monitor/          tour, walk-to, speech, visitors, Ask Molly
│   │   ├── mapping/          sites, mapping, localization, POI + tour editors
│   │   ├── system/           health, nodes, /rosout logs
│   │   └── settings/         connection, AI assistant, camera, motion, speech, theme
│   ├── api/
│   │   ├── chat/             LLM gateway: status (GET), ask + stream (POST)
│   │   └── conversations/    shared conversation history
│   ├── globals.css           Tailwind + light / dark tokens + reduced-motion
│   └── layout.tsx            Root HTML, fonts, theme + shell init scripts, ThemeProvider
│
├── components/
│   ├── brand/                CompanyLogo, PartnerLockup, Credits
│   ├── display/              visitor display: Showcase, hero camera + captions, stat tiles,
│   │                         tour journey, location map, chat + history, header widgets,
│   │                         daily stats tracker, demo autopilot
│   ├── error/                ErrorBoundary, RouteError
│   ├── feedback/             Toast viewport, ConnectionBanner
│   ├── layout/               AppSection (card), AppSidebar (column of cards), EstopButton
│   ├── map/                  OccupancyCanvas, RobotMap + renderers (pure) + palettes + hooks
│   ├── providers/            Theme, Connection, Simulation, RosSync, TourController, Conversation
│   ├── robot/                ActivityBadge, CameraFeed, Stat
│   ├── shell/                AppShell, Sidebar (+ robot card, tooltips), TopBar
│   │                         (ShowcaseBar / OperatorBar), footer, presentation controls,
│   │                         ShellEffects (prefs, shortcuts, fullscreen, idle pointer)
│   ├── skeleton/             Loading placeholders
│   ├── theme/                ThemeToggle, ThemeSwitcher
│   └── ui/molly/             Form primitives (Button, ConfirmButton, Field, …)
│
├── constants/                Brand, navigation, activity styles, gestures
│
├── hooks/
│   ├── use-robot-api         RobotApi for the current mode (live or mock)
│   ├── use-robot-action      run an action from a button: busy key + error toast
│   ├── use-ros-sync          robot topics → domain stores (live)
│   ├── use-mock-sync         mock robot → domain stores (offline)
│   ├── use-tour-controller   tour commands + optimistic FSM
│   ├── use-assistant         ask Molly: LLM gateway or the robot, speak, history
│   ├── use-conversation-sync history load + poll, LLM status
│   ├── use-robot-story       what Molly is doing, in visitor terms
│   ├── use-display-mode      live / demo / offline for the display
│   ├── use-caption           live caption of what Molly says
│   ├── use-theme             light / dark / system
│   ├── use-ui-prefs          sidebar / presentation preferences (saved per browser)
│   ├── use-presentation      enter / leave presentation mode, fullscreen
│   ├── use-idle-cursor       pointer resting (hidden while presenting)
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
│   ├── conversation/         chat API client, live context, text helpers
│   ├── display/              visitor copy (id / en), robot story
│   ├── system/               health JSON, /rosout entries
│   ├── tour/                 FSM pure logic + wire codec
│   ├── map/                  frame helpers (base_link → map)
│   ├── theme.ts              theme storage, resolve, no-flash init script
│   ├── ui-prefs.ts           shell preferences on <html>, no-flash init script
│   └── utils.ts              cn() (clsx + tailwind-merge)
│
├── server/                   Server only (route handlers, server components)
│   ├── assistant/            LLM config, prompt builder, OpenAI-compatible client,
│   │                         <think> filter
│   ├── conversations.ts      history in $DATA_DIR/conversations.jsonl
│   ├── brand.ts              which logo files are in public/brand/
│   ├── validate.ts           request checks and clipping
│   └── request.ts            client address, rate limiter
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
│   ├── use-interaction-store speech, greeter, visitors
│   ├── use-conversation-store chat entries mirrored from the server + LLM status
│   ├── use-system-store      health, logs
│   ├── use-tour-store        tour state mirror
│   ├── use-toast-store       toasts
│   ├── use-theme-store       light / dark
│   ├── use-ui-store          sidebar, presentation mode, mobile drawer
│   ├── use-display-store     display language, spoken answers (persisted)
│   ├── use-daily-stats-store today's tours and distance (persisted)
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
server/      ← lib, constants, types (never imported by client code)
mocks/       ← lib, types
stores/      ← types
constants/   ← types
types/       ← nothing (leaves)
```

**Invariant**: `lib/*` never imports from `components/` or `app/`. Types never import from
anywhere except other types. `server/*` is imported only by route handlers and server
components (the LLM key lives there). This keeps the dependency graph one-way and prevents
cycles.

## Provider Tree

```
RootLayout                     theme + shell init scripts (no flash), ThemeProvider
└─ AppLayout (every page)      AppShell
   └─ AppProviders             mounted once: navigating keeps all of it running
      └─ ConnectionProvider          opens rosbridge with the saved URL + namespace
         └─ SimulationLayer          mock robot → stores while offline / USE_MOCKS
            └─ RosSyncLayer          robot topics → stores while connected
               └─ TourController     useTourSync: /tour/state (or the mock tour)
                  └─ ConversationLayer  history load + poll, LLM status
                     ├─ ShellEffects    prefs on <html>, Ctrl/⌘ B, Esc, fullscreen, stats
                     ├─ Sidebar · TopBar · footer · toasts
                     └─ {children}      the page, faded in on navigation
```

There is one tour state machine for the app: `useTourSync` (mounted once) owns the
subscription or the mock runner, and every `useTourController()` sends commands to it, so a
tour started on one page keeps running on the next.

The visitor display reads the same stores but decides for itself what to show
(`useDisplayMode`): `live` with a robot, `demo` on a `USE_MOCKS` build (with a demo autopilot
that keeps tours running), and `offline` — a resting state instead of the mock robot the
operator pages fall back to.

Mock mode is `env.USE_MOCKS || connection !== "connected"`. The two sync layers are
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

## Conversations

```
screen (display / monitor) ── useAssistant ──► POST /api/chat ──► LLM_API_URL
   │                                              │ (prompt: persona, config/assistant.md,
   │                                              │  live context, recent turns)
   │◄──────────── streamed answer ◄───────────────┤ saved to the history
   ├─ api.say(answer) → robot speaks
robot (asked in person) ── /interaction/conversation ──► every screen ──► POST /api/conversations
every screen ◄── GET /api/conversations?since= (4 s poll) ── shared history
```

See [ASSISTANT.md](ASSISTANT.md).

## Shell Preferences

`html[data-sidebar="collapsed"]` and `html[data-presentation="on"]` are set before the first
paint from `localStorage` (`lib/ui-prefs.ts`), so a kiosk reload never flashes the sidebar.
Tailwind variants follow them: `sb-collapsed:` (icon-only sidebar) and `presenting:` (no
operator chrome). Presentation mode only applies on `/`, and scales the root font size with
the screen there; elsewhere rem stays 16px, so the shell keeps its size between pages. Page
layouts use container queries (`@container`, `@5xl:` …), not the viewport, because the space
next to the sidebar is what they get.

## Theme

`<html data-theme="light|dark">` is set by an inline script before the first paint (saved
choice or the OS preference); every color is a CSS variable with both values, so components
never branch on the theme. The map canvas cannot read CSS variables: `ThemeProvider` swaps the
renderers' palette and the occupancy image is re-baked with the theme's colors.

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
