# Ask Molly — LLM Gateway

How visitors' questions get answered, what the model is told, and where the conversations go.

## Flow

```
Display / Monitor chat                     Dashboard server                 LLM
──────────────────────                     ────────────────                 ───
useAssistant().ask(q)
  │ live context from the stores
  │ (place, activity, tour, stops,
  │  battery, visitors) + last turns
  ▼
POST /api/chat ──────────────────────────► rate limit (20/min per address)
                                           validate + clip everything
                                           build Molly's prompt:
                                             persona + answer rules
                                             config/assistant.md
                                             live status + places
                                             recent turns
                                           POST LLM_API_URL ───────────────► chat/completions
                                                                              stream: true
  ◄──────────── text stream ◄───────────── hide <think>…</think> ◄───────── SSE deltas
answer streams into the chat               save to the history
  │
  ├─ api.say(answer)  → robot speaks it (/interaction/say), "spoken" saved
  ▼
every other screen picks it up from GET /api/conversations (polled every 4 s)
```

Without `LLM_API_URL` (or with **Settings → AI Assistant → Robot conversation node**), the
question goes to the robot instead: `/interaction/ask` with `speak`, and the screen stores the
answer in the history.

Questions asked to the robot **in person** arrive on `/interaction/conversation`; every open
screen hears them and posts them, and the server keeps one copy (same question and answer within
three minutes).

## Configuration

Set on the dashboard server (`.env.local`, `deploy/.env`), never in the browser:

```bash
LLM_API_URL=https://api.openai.com/v1      # or …/chat/completions
LLM_API_KEY=sk-…
LLM_MODEL=gpt-4o-mini
```

Any OpenAI-compatible server works:

| Provider | `LLM_API_URL` | Notes |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | |
| OpenRouter | `https://openrouter.ai/api/v1` | `LLM_MODEL` like `meta-llama/llama-3.1-70b-instruct` |
| Groq | `https://api.groq.com/openai/v1` | fast, good for spoken answers |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | |
| Ollama | `http://localhost:11434/v1` | no key; from Docker on the Mac mini: `http://host.docker.internal:11434/v1` |
| vLLM, LM Studio, llama.cpp | `http://<host>:<port>/v1` | `LLM_MODEL` may stay empty |

Reasoning models that write `<think>…</think>` (DeepSeek-R1, Qwen3 on Ollama) work: the reasoning
is hidden while streaming.

`GET /api/chat` tells whether a model is configured (`{external, model, host}`, no key); Settings
shows it with a re-check button.

## The Prompt

Built in `src/server/assistant/prompt.ts`:

- **Persona** — Molly, a four-legged robot guide built by PT Ezra Robotics Teknologi, working at
  the Indosat Ooredoo Hutchison experience center.
- **Answer rules** — the visitor's language (Bahasa Indonesia or English, from the display's
  toggle), 1–3 short sentences because they are spoken, plain text, honest when she does not know
  ("ask the staff"), never inventing prices, schedules or names, polite refusals.
- **Venue knowledge** — `config/assistant.md` (`LLM_CONTEXT_FILE`), HTML comments stripped, read
  again whenever the file changes. Put the experience center's confirmed facts there: exhibits,
  opening hours, facilities.
- **Live status** — local time (`LLM_TIMEZONE`), demo or live, what Molly is doing, where she is,
  battery, visitors around, the running tour (stop *i* of *n*, next stop) and every place with
  its description and narration.
- **Extra instructions** — `LLM_SYSTEM_PROMPT`, appended last.

The screen sends the live status with each question; the server clips every field (40 places,
200–400 characters each, 6 earlier turns) before it reaches the prompt.

## History

`$DATA_DIR/conversations.jsonl` (`./data` by default, the `molly-data` volume in Docker): one JSON
line per exchange, the last 2000 kept.

| Endpoint | |
|---|---|
| `GET /api/conversations?since=<ms>` | entries changed after `since` (and when it was last cleared) |
| `POST /api/conversations` `{entry}` | store one exchange; returns the stored (canonical) entry |
| `DELETE /api/conversations` | clear for every screen (Settings → AI Assistant, Monitor) |

Settings → AI Assistant → **Export JSON** downloads it. If the disk is not writable the history
keeps working in memory until the server restarts (logged once).

## Limits and Safety

- 20 questions per minute per client address, 500 characters per question.
- The LLM's error text stays in the server log; the screen shows a friendly sentence.
- There is no login: anyone who can open the dashboard can ask and clear the history. Keep it on
  the venue's network or behind the tunnel's access policy.

## Testing Without a Model

Any small server that speaks the chat completions SSE format will do; with Ollama:

```bash
ollama pull llama3.2
LLM_API_URL=http://localhost:11434/v1 LLM_MODEL=llama3.2 pnpm dev
```
