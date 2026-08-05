# Privacy

This policy describes the behavior of the source code in this repository. A
deployer operates their own instance and must publish deployment-specific
contact, retention, jurisdiction, and provider details before public use.

## Data Flow

- A selected image and requested analysis language are sent to the configured
  Supabase Edge Function. The function sends the image to Google Gemini for
  analysis. The image therefore leaves the browser.
- Supabase Anonymous Auth creates a session that the browser persists locally
  and refreshes automatically.
- When configured, Cloudflare Turnstile loads for a new anonymous session and
  processes the verification interaction.
- Precise geolocation is optional. The browser requests it only after the user
  presses the location button. Coordinates, district selection, and the user's
  description are assembled into the local email draft; this repository's app
  does not send them to the image-analysis function.
- The app requests CARTO map tiles, a commit-pinned district-boundary file from
  GitHub, and live economic indicators from BCRP. Those services receive normal
  network metadata such as IP address and user agent.

The repository contains no first-party analytics integration and does not
persist reports to an application database. Opening `mailto:` does not send the
message; the user's email provider handles any message they choose to send.

## Retention and Deletion

This repository does not establish or control Supabase, Google, Cloudflare,
CARTO, GitHub, BCRP, or email-provider retention. Operators must review their
configured providers, contracts, regions, logs, and deletion controls. Clearing
site data removes the local anonymous session but does not prove deletion from
external providers.

## User Choices

- Do not upload images containing faces, license plates, addresses, documents,
  or other sensitive information unless you accept the operator's published
  policy.
- Decline geolocation and select a district manually.
- Review and edit every AI-generated statement before using the draft.
- Remove coordinates or other details from the email draft before sending.
- Clear browser site data to remove the locally persisted anonymous session.

Security vulnerabilities should be reported through [SECURITY.md](SECURITY.md),
not through a public issue.
