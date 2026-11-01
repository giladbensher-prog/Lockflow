# LOCKFLOW — the daily app

LOCKFLOW as a real, daily tool: one anchor per area (GYM · BIZ · SOCIAL), tasks
that carry over, a 9:00 plan and an 8:00 PM close-out. Built from the LOCKFLOW
design system (`vendor/ds-bundle.js`).

## How it works on iPhone
- Data lives only in Safari on the phone (`localStorage`, key `lockflow:v1`).
  Settings → **Copy backup** exports it.
- Calendar, Reminders and Health arrive from an iOS **Shortcut** that opens
  `…/#sync=<text>`. The part after `#` never leaves the phone. The app reads it,
  stores it, and strips it from the address bar.
- Shortcut automations at 9:00 and 20:00 open the app on schedule.
- Step-by-step setup (Hebrew): `setup.html` — also linked from the app.

### Onboarding and the weekly training plan
- First run asks about GYM (sports; fixed days or a number of times a week;
  who plans: **AI**, **my own plan**, or **mix**; conditions and session length),
  BIZ and SOCIAL. Settings → **Edit setup** reopens it.
- The AI steps hand a ready prompt to the Claude app (it knows the user from
  their chats) and read back a `KEY: value` template. Plans use `SUN:`…`SAT:`
  for fixed days or `S1:`, `S2:`… for a schedule that moves.
- Plans are stored per week (`plans[<Sunday yyyy-mm-dd>]`). On Saturday the app
  shows the week's report and asks for next week's plan: the AI proposes →
  **Happy with this plan?** → yes locks it in, no opens changes (tell the AI
  what doesn't fit, or edit lines by hand). A session counts as done when a GYM
  anchor with the same title is closed.

### Sync format
One record per line, fields split by `|`:

| Line | Meaning |
| --- | --- |
| `T\|2026-10-31` | date of the data |
| `E\|09:30\|10:00\|title` | calendar event today (`00:00\|00:00` = all day) |
| `R\|list\|title` | reminder due today |
| `S\|6420` | steps today |
| `K\|4.8` | walking + running km today |
| `M\|34` | exercise minutes today |

Numbers in either locale style work (`6,420`, `4,8`).

## Files
- `index.html` — app shell and styles (tokens from `design-system/tokens`).
- `src/app.jsx` — app source. `app.js` — compiled output (commit both).
- `setup.html` — iPhone setup guide.
- `sw.js` — service worker (offline after first visit).
- `manifest.webmanifest`, `icons/` — icon and metadata. `display: browser` on
  purpose: a home-screen *web app* on iPhone gets storage separate from Safari,
  and sync always opens Safari.

## Build
```
./build.sh        # src/app.jsx → app.js (esbuild, classic JSX, React as a global)
```
Then bump `VERSION` in `sw.js` if cached files changed shape.

## Run locally
```
python3 -m http.server 8080    # from this folder, then open http://localhost:8080/
```
