# Donde Esta Mi Plata

Prototype for testing a Lima municipal budget reporting idea.

This is not production civic infrastructure. It is a Vite/React demo that lets a user upload an infrastructure photo, asks Gemini to classify it, shows budget context for a district, and generates a draft email-style complaint. Treat the output as a starting point to verify, not as proof.

## What Works

- Upload a photo and preview it in the browser.
- Send the image data to Gemini 2.5 Flash for classification, severity, and a rough repair-cost estimate.
- Show Lima district budget context from Supabase when configured, with static fallback data in the repo.
- Show simulated citizen reports on the map.
- Generate a draft municipality message and open it in the user's email client with a `mailto:` link.
- Switch between Spanish, English, and Quechua UI strings.

## Hard Limits

- Uploaded image data is sent to Google Gemini. It leaves the browser.
- This Vite app embeds configured environment variables into the client bundle. If you put a Gemini API key in client-side config, assume it is exposed to anyone using the built app.
- Report persistence is a placeholder. `uploadReportToSupabase` currently returns success without saving a report.
- The municipality email addresses are generated placeholders like `municipalidad_lima@gob.pe`. Verify real addresses yourself.
- Budget data can come from Supabase or static fallback data. It may be mock, incomplete, stale, or wrong unless you verify it against an official source.
- Gemini classifications and repair-cost estimates can be wrong.
- This is not legal advice.
- This is not an official complaint channel.

## Local Setup

Requirements:

- Node.js 18+
- A Gemini API key if you want photo analysis to call Gemini
- Supabase URL and anon key if you want live budget rows from a `budget_lima` table

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at `http://localhost:3000`.

Build locally with:

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and set:

| Variable | What it is used for |
| --- | --- |
| `GEMINI_API_KEY` | Sent from the client bundle to Gemini for image analysis |
| `SUPABASE_URL` | Supabase project URL for budget lookup |
| `SUPABASE_ANON_KEY` | Supabase anon key for budget lookup |

Do not use a private server-side Gemini key directly in this client app if the build will be shared. Put Gemini behind a backend proxy before treating this as more than a local demo.

## Data Flow

1. The browser reads the uploaded image with `FileReader`.
2. The app sends base64 image data to Gemini from `services/geminiService.ts`.
3. Gemini returns a JSON classification, severity, description, and estimated repair cost.
4. The app matches the result to local district budget categories.
5. Supabase budget data is used when available; otherwise the app falls back to static data in `constants.ts`.
6. The app generates a draft message and a placeholder municipality email address.
7. Sending uses `mailto:`. The app does not submit an official complaint.

## Project Map

- `App.tsx`: top-level view switching and data loading.
- `components/ReportFlow.tsx`: image analysis flow and draft complaint generation.
- `components/MapView.tsx`: district map.
- `services/geminiService.ts`: Gemini image request.
- `services/supabase.ts`: budget lookup and stubbed report functions.
- `utils/dataProcessing.ts`: budget aggregation.
- `constants.ts`: static budget fallback data and simulated reports.
- `translations.ts`: Spanish, English, and Quechua strings.

## License

MIT. See `LICENSE`.
