# Benner Observatory

A small, dependency-free web app for tracking sourced market facts and comparing your interpretation with a Benner cycle reference. Created as a Conatus project on 21 November 2026.

## Run locally

Requires Node.js 20 or later. From this directory:

```sh
npm run dev
```

Open http://localhost:3000. No `npm install` is needed. Use `PORT=3001 npm run dev` if port 3000 is occupied. Always use the same hostname and port to access the same browser data. The server only listens on this computer.

```sh
npm test
```

## Included

- Interactive Benner reference timeline, with 1990–2045 and 1924–2059 views.
- Select a year to inspect exact reference markers and write a scenario.
- Create, edit and delete sourced facts, with event dates, market, source URL and interpretation.
- Mark evidence as supporting, challenging or neutral toward your thesis.
- Filter by market, selected year and text.
- Browser-local persistence, JSON export and validated replacement import.
- Responsive layout, keyboard-accessible timeline markers and native modal form.

The ledger starts empty: no market facts, prices or demonstrated forecasting accuracy are implied. Source links are entered by you; the app validates URL syntax, not source reliability. Scenario notes are keyed by year, across all markets.

## Project map

| File | Purpose |
| --- | --- |
| `index.html` | Accessible page structure and fact form |
| `src/style.css` | Responsive dark research interface |
| `src/app.js` | Rendering, CRUD, local persistence, import/export |
| `src/model.js` | Reference data, record schema, validation |
| `server.mjs` | Dependency-free local static server |
| `test/model.test.js` | Reference and import validation checks |
| `notes/methodology.md` | Source provenance and model limitations |
| `charter.md`, `state.md`, `decisions.md` | Conatus project context and next steps |

## Record shape

```json
{
  "id": "a-unique-id",
  "title": "A concrete observation",
  "date": "2026-11-21",
  "market": "Global",
  "source": "https://example.com/original-release",
  "stance": "Neutral",
  "note": "Your interpretation, separate from the observation."
}
```

Backups contain `{ "version": 1, "facts": [], "scenarios": { "2026": "Your scenario" } }`. Import replaces current research after confirmation; export before importing. Data is saved in localStorage under `conatus.benner-observatory.v1`. Clearing site data removes it; exports are your backup. There is no database, login, live feed or cloud sync yet.

## Next development steps

1. Choose the first market and define measurable hypotheses with dates and invalidation conditions.
2. Audit the selected chart transcription before using it in quantitative work.
3. Add a separately sourced price series with provider, symbol, currency, adjusted/unadjusted status and observation timestamps. Do not turn the calendar markers into a synthetic price curve.
4. Add frozen, timestamped predictions and an evaluation window, then compare with simple baselines using out-of-sample data.
5. Add a database and authentication when multi-device access is needed. Keep provider secrets on the server.

This is a research starter. The reference model is not a validated forecasting engine.
