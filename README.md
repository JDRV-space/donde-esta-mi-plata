# Donde Esta Mi Plata

Civic reporting aid for exploring Lima municipal budget context and preparing
an editable complaint draft.

The app lets a user upload a photo, analyzes it through an authenticated
Supabase Edge Function, shows static 2025 budget context for a district, and
opens a draft complaint in the user's email client. Treat every classification,
cost estimate, municipality address, and budget figure as unverified input.

## Security Architecture

The browser never receives or calls Gemini with `GEMINI_API_KEY`.

1. The browser validates a JPEG, PNG, or WebP image up to 5 MiB.
2. Supabase Anonymous Auth creates or reuses a persisted authenticated session.
3. The browser invokes the JWT-protected `analyze-image` Edge Function with
   multipart form data.
4. The function repeats size, MIME, and file-signature validation.
5. A Postgres function atomically enforces 10 analyses per authenticated user
   per one-hour window.
6. The Edge Function calls Gemini with server-side secrets and validates the
   structured output before returning it.

The Edge Function returns explicit errors for invalid requests, authentication,
user rate limits, provider quota limits, provider failures, and invalid provider
responses. It fails closed if the quota database function is unavailable.

## Hard Limits

- The image leaves the browser and is processed by Supabase and Google Gemini.
- Anonymous users can create a new identity after clearing browser storage.
  Supabase recommends CAPTCHA or Cloudflare Turnstile for anonymous sign-in
  abuse prevention. Enabling one is a required production control.
- The repository rate limit is per authenticated Supabase user. It is a cost
  guardrail, not a replacement for CAPTCHA, provider quotas, billing alerts, or
  edge/WAF controls.
- Reports are not persisted or submitted to a municipality.
- `mailto:` only opens the user's email client.
- Municipality email addresses are generated fallbacks and may not exist.
- Budget context is static repository data and may be incomplete or stale.
- The map still depends on CARTO raster tiles, a commit-pinned district GeoJSON
  dataset hosted by GitHub, and the BCRP statistics API.
- Image classifications and repair-cost estimates can be wrong.
- This is not legal advice or an official complaint channel.

## Requirements

- Node.js 22, or Node.js 24 and later
- npm 10 or later
- Deno 2 for Edge Function checks and tests
- Supabase CLI for local database/function work and deployment
- A Supabase project
- A Gemini API key restricted to the Gemini API

## Browser Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set only browser-safe Supabase values in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase publishable key |
| `VITE_TURNSTILE_SITE_KEY` | Browser-safe Turnstile site key used by Supabase Auth |

Legacy `VITE_SUPABASE_ANON_KEY` is accepted for projects that have not migrated
to publishable keys. Never add `GEMINI_API_KEY`, a Supabase secret key, or a
service-role key to a `VITE_` variable.

## Supabase Deployment

Before production:

1. Enable Anonymous Sign-Ins in Supabase Auth.
2. Configure Cloudflare Turnstile in Supabase Auth, then put the matching
   browser-safe site key in `VITE_TURNSTILE_SITE_KEY`. The Turnstile runtime is
   loaded from Cloudflare's required official URL only when a new anonymous
   session needs verification.
3. Apply the migration:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

4. Configure Edge Function secrets:

   ```bash
   supabase secrets set \
     GEMINI_API_KEY=YOUR_SERVER_SIDE_KEY \
     GEMINI_MODEL=YOUR_SUPPORTED_GEMINI_MODEL \
     ALLOWED_ORIGINS=https://your-production-origin.example
   ```

   `ALLOWED_ORIGINS` is a comma-separated exact-origin allowlist. Include the
   scheme and port when applicable. Do not use `*`.

5. Deploy the authenticated function:

   ```bash
   supabase functions deploy analyze-image
   ```

6. Configure Gemini project quotas and billing alerts. Rotate any key that was
   previously bundled into a browser build.

## Validation

Run the clean release checks:

```bash
deno install --frozen --entrypoint supabase/functions/analyze-image/index.ts
npm ci
npm run security:audit
npm run typecheck
npm test
npm run build
```

With the local Supabase stack running, verify the migration and database lint:

```bash
supabase start
supabase db reset
supabase db lint --local
```

The Edge Function's live Gemini call is intentionally not part of repository
tests because it requires deployment credentials and consumes provider quota.

## Project Map

- `components/ReportFlow.tsx`: image-analysis flow and complaint draft.
- `services/imageAnalysisService.ts`: browser validation, anonymous auth, and
  authenticated Edge Function invocation.
- `services/supabase.ts`: browser-safe Supabase client configuration.
- `supabase/functions/analyze-image/`: server-only request validation, Gemini
  call, structured-response validation, and tests.
- `supabase/migrations/`: database-backed rate limit with denied direct table
  access and a narrowly granted quota function.
- `styles/index.css`: locally bundled fonts, icons, Leaflet CSS, and Tailwind
  entrypoint.
- `utils/dataProcessing.ts`: static budget aggregation and formatting.

## Official References

- [Google API key security](https://ai.google.dev/gemini-api/docs/api-key?authuser=2&hl=en)
- [Google image understanding](https://ai.google.dev/gemini-api/docs/generate-content/image-understanding?authuser=4)
- [Google structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Supabase Edge Function authentication](https://supabase.com/docs/guides/functions/auth)
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Supabase Anonymous Auth](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Edge Function rate limiting](https://supabase.com/docs/guides/functions/examples/rate-limiting)
- [Cloudflare Turnstile client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database-function security](https://supabase.com/docs/guides/database/functions)

## License

Apache License 2.0. See [LICENSE](LICENSE). Attribution notices are in
[NOTICE](NOTICE).
