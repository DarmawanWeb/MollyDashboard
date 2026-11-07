# Molly Dashboard

[![CI](https://github.com/DarmawanWeb/mollydashboard/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/DarmawanWeb/mollydashboard/actions/workflows/ci.yml)

The screens of **Molly**, the AI tour-guide robot by **PT Ezra Robotics Teknologi** at the
**Indosat Ooredoo Hutchison** experience center: a visitor display for the big screen and the
operator pages for the staff. Molly is a Deep Robotics Lite3 (Jetson Orin NX, ROS 2 Humble).
Built with Next.js 16, React 19 and Tailwind v4, in light and dark mode.

The robot side is [DarmawanRobotics/Molly](https://github.com/DarmawanRobotics/Molly)
(navigation, mapping, AprilTag localization, tours, speech and the web bridge), driven by
[lite3_ros2](https://github.com/DarmawanRobotics/lite3_ros2). The handheld remote is
[MollyController](https://github.com/DarmawanRobotics/MollyController).

```
┌──────────────────────────────────────────────────────┐
│  Dashboard (this repo): sidebar + top bar on every   │
│  page, presentation mode for the TV                  │
│  ├─ /           visitor display: camera + captions,  │
│  │              map, tour journey, stats, Ask Molly  │
│  ├─ /monitor    tour, walk-to, speech, visitors, chat│
│  ├─ /mapping    sites, map, tags, POIs, tours        │
│  ├─ /system     health, nodes, /rosout logs          │
│  ├─ /settings   robot, camera, AI, speech, theme     │
│  └─ /api/chat   LLM gateway (any OpenAI-compatible)  │
└───────┬──────────────────────────────┬───────────────┘
        │ rosbridge ws://<robot>:9090  │ LLM_API_URL (server side)
        │ web_video_server :8080       │
┌───────▼──────────────────────┐  ┌────▼─────────────────────┐
│ Robot: molly robot.launch.py │  │ OpenAI, OpenRouter, Groq,│
│ web:=true                    │  │ vLLM, LM Studio, Ollama… │
└──────────────────────────────┘  └──────────────────────────┘
```

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # robot address, camera server, mock flag, LLM
pnpm dev                     # http://localhost:3010 (PORT=… to change)
```

No robot around? Development builds run against an in-memory demo robot that walks tours,
speaks the narrations and answers simple questions, so every screen moves. Set
`NEXT_PUBLIC_USE_MOCKS=false` to talk to a robot in dev.

On the robot, start the stack with the web bridge:

```bash
ros2 launch molly robot.launch.py web:=true
```

## The Visitor Display (`/`)

Made for a TV or a touch screen at the experience center: nothing technical, everything in
Bahasa Indonesia or English (toggle in the header), light or dark.

- **Co-branding** — the Indosat Ooredoo Hutchison and Ezra Robotics logos, see
  [docs/BRANDING.md](docs/BRANDING.md) for the files.
- **Molly's view** — the live camera with what she is doing ("Guiding a tour to Hall B") and
  live captions of everything she says.
- **Where is Molly** — the floor plan with Molly, the tour stops and the visitors around her.
- **Tour journey** — the stops done, the current one and what comes next; between tours, the
  places Molly can show.
- **Today** — visitors nearby, questions answered, tours, distance walked, battery.
- **Ask Molly** — visitors type a question (or tap a suggestion) and Molly answers in the chat
  and out loud. Questions asked to the robot in person show up too. **History** lists every
  conversation, grouped by day, with a search.

The display adapts to the width it gets: three columns that fill the screen, two that scroll
next to an open sidebar on a laptop, one on a phone. When a production build cannot reach the
robot it says Molly is taking a break instead of showing made-up data.

## Navigation and Presentation Mode

Every page shares one frame: a **sidebar** on the left (Showcase for visitors; Monitor,
Mapping, System and Settings for the operator; Molly's status and the partners at the bottom)
and a **top bar** in the same place on every page. Navigating keeps the robot connection, the
tour and the chat running; only the page content changes.

- **Collapse** the sidebar to icons with the button on its edge or **Ctrl/⌘ B** (remembered per
  browser). On phones and tablets the **☰** button at the top left opens it as a drawer.
- **Presentasi / Present** in the Showcase top bar hides the sidebar and operator controls and
  goes full screen, scaled for the TV; the mouse pointer hides when it rests. **Esc**, or
  **holding** the ⤡ button at the top right, leaves it; a tap alone does not, so visitors can't
  drop into the operator pages.
- **Kiosk:** open `http://<server>:4470/?present=1` (e.g. `chrome --kiosk …`) to start in
  presentation mode; it is remembered, and `?present=0` turns it off.

## Ask Molly: the LLM Gateway

Answers come from any **OpenAI-compatible** chat completions API, called by the dashboard
server so the key never reaches a browser. Before every question the gateway builds Molly's
prompt from:

1. Molly's persona and answer style (short, spoken, in the visitor's language),
2. the venue knowledge in [`config/assistant.md`](config/assistant.md) (edit it),
3. the **live robot context** the screen sends: where Molly is, what she is doing, the tour and
   its stops with their descriptions and narrations, battery, visitors around,
4. the last few exchanges, for follow-up questions.

The answer streams into the chat, is said by the robot (`/interaction/say`) and lands in the
shared history (`$DATA_DIR/conversations.jsonl`). Without `LLM_API_URL` the robot's own
conversation node answers (`/interaction/ask`), as before. Details in
[docs/ASSISTANT.md](docs/ASSISTANT.md).

## Configuration

Browser, build time (`NEXT_PUBLIC_*`, inlined by `pnpm build`, read in `src/lib/env.ts`):

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_ROSBRIDGE_URL` | `ws://localhost:9090` | rosbridge WebSocket, `ws://` or `wss://` |
| `NEXT_PUBLIC_VIDEO_SERVER_URL` | `http://localhost:8080` | web_video_server base |
| `NEXT_PUBLIC_USE_MOCKS` | `true` in dev, `false` in production | always the demo robot |

Server, run time (never sent to the browser):

| Variable | Default | Meaning |
|---|---|---|
| `LLM_API_URL` | — | OpenAI-compatible base (`https://api.openai.com/v1`, `http://localhost:11434/v1`) or full `…/chat/completions` URL; unset: the robot answers |
| `LLM_API_KEY` | — | Bearer token, if the API needs one |
| `LLM_MODEL` | — | model name; unset: left out (single-model servers) |
| `LLM_TEMPERATURE` | `0.5` | 0–2 |
| `LLM_MAX_TOKENS` | `320` | answer length cap |
| `LLM_TIMEOUT_MS` | `45000` | whole answer |
| `LLM_SYSTEM_PROMPT` | — | extra instructions appended to Molly's prompt |
| `LLM_CONTEXT_FILE` | `config/assistant.md` | venue knowledge file |
| `LLM_TIMEZONE` | `Asia/Jakarta` | "now" in the prompt |
| `DATA_DIR` | `./data` | where the conversation history is kept |

The robot address, camera server, robot namespace, answer engine, spoken answers and theme can
also be changed at runtime in **Settings**; they are saved in the browser.

## Deploy

On a shared server (the Mac mini next to NETRA, Taksu and the monitoring stack) the dashboard runs
in Docker as the compose project `molly`, published on the loopback only, for cloudflared:

```bash
cp deploy/.env.example deploy/.env   # port, bind address, robot defaults, LLM
deploy/deploy.sh                     # checks the port, builds, starts, waits for /monitor
```

| Port | Used by |
|---|---|
| 4470 | Molly Dashboard (`MOLLY_PORT`) |
| 4480 | Taksu |
| 4490, 4491 | NETRA |
| 80, 8080, 3000, 3100, 9090, 11434 | already taken on the Mac mini (web, Grafana, Loki, Prometheus, Ollama) |

`deploy.sh` stops before building when another program or compose project holds `MOLLY_PORT`. In
`~/.cloudflared/config.yml`, point the hostname at `http://127.0.0.1:4470`. The conversation
history lives in the `molly-data` volume. To use the Mac mini's Ollama, set
`LLM_API_URL=http://host.docker.internal:11434/v1` and a model it has pulled.

An https page cannot open the robot's plain `ws://` rosbridge, so through the tunnel the dashboard
is a demo on the demo robot (`NEXT_PUBLIC_USE_MOCKS=true`). To show the real robot, open it over
the LAN: `MOLLY_BIND=0.0.0.0` and `http://<server>:4470` from a computer on the robot's network, or
run `pnpm build && pnpm start` on a laptop there. The dashboard has no login: keep it on the
venue's network (or behind the tunnel's access policy).

## Routes

| Route | Purpose |
|---|---|
| `/` | Visitor display (see above) |
| `/monitor` | Camera, robot status, map with the path and visitors, tour control, walk to a POI, speech, greeter and gestures, Ask Molly |
| `/mapping` | Load a site, record a map, localize and record AprilTags, place POIs on the map (drag for the heading), edit tours |
| `/system` | Health (CPU / GPU / RAM / temperature, topic rates, issues), ROS nodes, `/rosout` log viewer |
| `/settings` | rosbridge / camera URLs, robot namespace, camera stream, AI assistant and history, walking speed, speech defaults and quick phrases, theme |

The software e-stop sits in the top bar of every operator page: one press engages it, releasing
needs a one-second hold. Driving, AUTO / REMOTE and posture are done with the handheld remote.

## Robot Contract

Every topic and service the dashboard uses is listed in Molly's
[docs/web.md](https://github.com/DarmawanRobotics/Molly/blob/main/docs/web.md) and mirrored
in `src/lib/ros/topics.ts`. [docs/ROBOT-SIDE.md](docs/ROBOT-SIDE.md) summarizes it.

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — module layout, data flow, robot API, tour FSM
- **[docs/ASSISTANT.md](docs/ASSISTANT.md)** — LLM gateway, prompt, history, providers
- **[docs/BRANDING.md](docs/BRANDING.md)** — logo files, names and credits
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** — local setup, demo robot, debugging
- **[docs/ROBOT-SIDE.md](docs/ROBOT-SIDE.md)** — what the robot has to run and expose
- **[CHANGELOG.md](CHANGELOG.md)** — notable changes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler), route handlers for the LLM gateway |
| Styling | Tailwind v4, light / dark CSS-variable tokens, self-hosted Plus Jakarta Sans / JetBrains Mono |
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

## Credits

Created by **Agus Darmawan**, PT Ezra Robotics Teknologi, for the Indosat Ooredoo Hutchison
experience center.

## License

Apache License 2.0, see [LICENSE](LICENSE).
