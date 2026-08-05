# Donde Esta Mi Plata

Prototype civic reporting aid for Lima. It analyzes a user-selected photo,
shows an explicitly unverified static 2025 budget snapshot, and prepares an
editable email draft.

## Project Status

- Prototype, not a government service or official complaint channel.
- No tagged releases or production support commitment currently exist.
- The app does not submit or persist reports and does not create official
  tracking records.
- Sample reports are deterministic interface examples, not citizen activity,
  municipal responses, or evidence of repairs.
- This repository provides general civic information, not legal advice.

Only the latest code on `main` is considered for fixes. Review
[SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), and
[CONTRIBUTING.md](CONTRIBUTING.md) before operating or contributing.

## What the App Does

1. The user selects a JPEG, PNG, or WebP image up to 5 MiB.
2. A Supabase anonymous session invokes the authenticated `analyze-image` Edge
   Function.
3. The function validates the image, applies a per-user rate limit, calls
   Google Gemini with server-side credentials, and validates the response.
4. The user reviews the AI output, manually confirms a district, optionally
   shares precise location, and writes their own description.
5. The app opens an email draft without a recipient. The user must find an
   official address, edit the draft, attach the photo, and send it themselves.

AI classifications, severity labels, descriptions, and repair-cost estimates
can be wrong. The local reference code is not an official case number.

## Budget Data Integrity

`utils/dataProcessing.ts` is the sole owner of the static 2025 budget snapshot
and district coordinates. The repository does not contain the snapshot's
primary-source URL, extraction date, query, or transformation evidence.
Accordingly:

- the values are labeled unverified in the interface;
- they are excluded from generated complaint drafts;
- they must not be cited as official MEF or municipal figures;
- maintainers should replace the snapshot only with reproducible provenance,
  source freshness, field definitions, and validation evidence.

`constants.ts` owns only deterministic interface examples. Live BCRP indicators
are shown only when the official API returns usable values; the app does not
substitute estimates after a failure.

## Requirements

- Node.js 22.x and npm 10 or later
- Deno 2.7.14 for Edge Function checks and tests
- Supabase CLI for local database work or deployment
- A Supabase project and a Gemini API key restricted to the Gemini API

CI validates Node.js 22 and Deno 2.7.14 on Linux. There is no automated
cross-browser or cross-platform support matrix. The browser flow requires
modern File APIs; geolocation is optional.

## Local Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set only browser-safe values in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key configured in Supabase Auth |

Legacy `VITE_SUPABASE_ANON_KEY` is accepted for projects that have not moved to
publishable keys. Never expose `GEMINI_API_KEY`, a Supabase secret key, or a
service-role key through a `VITE_` variable.

## Supabase Deployment

Before deploying an operator-owned instance:

1. Enable Anonymous Sign-Ins and configure Cloudflare Turnstile in Supabase
   Auth. Turnstile is a required production abuse control.
2. Apply the rate-limit migration:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Configure server-side secrets:

   ```bash
   supabase secrets set \
     GEMINI_API_KEY=YOUR_SERVER_SIDE_KEY \
     GEMINI_MODEL=YOUR_SUPPORTED_GEMINI_MODEL \
     ALLOWED_ORIGINS=https://your-production-origin.example
   ```

   `ALLOWED_ORIGINS` is a comma-separated exact-origin allowlist. Do not use
   `*`.

4. Deploy the function:

   ```bash
   supabase functions deploy analyze-image
   ```

5. Configure Gemini quotas and billing alerts, publish the operator's privacy
   details, and verify all external-service terms before public use.

## Validation

```bash
deno install --frozen --entrypoint supabase/functions/analyze-image/index.ts
npm ci
npm run security:audit
npm run typecheck
npm test
npm run build
```

With the local Supabase stack running:

```bash
supabase start
supabase db reset
supabase db lint --local
```

The repository test suite does not call Gemini because that requires deployment
credentials and consumes provider quota.

## Source-of-Truth Map

- `README.md`: public scope, setup, architecture, limits, and documentation map.
- `PRIVACY.md`: repository behavior and operator privacy responsibilities.
- `SECURITY.md`: supported-version and private-reporting path.
- `CONTRIBUTING.md`: contribution workflow and evidence requirements.
- `utils/dataProcessing.ts`: unverified static budget snapshot and coordinates.
- `constants.ts`: deterministic sample-only interface records.
- `components/ReportFlow.tsx`: photo-analysis and editable draft flow.
- `services/imageAnalysisService.ts`: browser validation, auth, and function call.
- `services/bcrpService.ts`: live BCRP parsing with no estimated fallback.
- `supabase/functions/analyze-image/`: server validation, Gemini call, and tests.
- `supabase/migrations/`: database-backed rate limiting.
- `.github/workflows/ci.yml`: clean-install release checks.

## External Data and Attribution

- Map tiles: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
  and [CARTO](https://carto.com/attribution/).
- District boundaries: commit-pinned
  [peru-geojson-datasets](https://github.com/joseluisq/peru-geojson-datasets).
- Economic indicators: [BCRP series API](https://estadisticas.bcrp.gob.pe/estadisticas/series/ayuda/api).

External map, boundary, and indicator requests can fail. The app must show an
unavailable state instead of inventing replacement data.

## Security References

- [Google API key security](https://ai.google.dev/gemini-api/docs/api-key?authuser=2&hl=en)
- [Google image understanding](https://ai.google.dev/gemini-api/docs/generate-content/image-understanding?authuser=4)
- [Google structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Supabase Edge Function authentication](https://supabase.com/docs/guides/functions/auth)
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Supabase Anonymous Auth](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Edge Function rate limiting](https://supabase.com/docs/guides/functions/examples/rate-limiting)
- [Cloudflare Turnstile rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)

## License

Repository-authored source and documentation are available under Apache-2.0.
Third-party code, fonts, icons, map tiles, and datasets retain their own terms.
See [LICENSE](LICENSE) and [NOTICE](NOTICE).
