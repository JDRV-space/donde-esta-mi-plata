# Contributing

Contributions are welcome while the project remains a prototype. Check the
repository's Issues tab before starting broad or incompatible work.

## Development Workflow

1. Use Node.js 22.x, npm 10 or later, and Deno 2.7.14.
2. Create a focused branch in your fork.
3. Install with `npm ci` and keep the lockfiles synchronized.
4. Make the smallest scoped change and update the owning documentation.
5. Run the validation commands in [README.md](README.md#validation).
6. Open a pull request that explains behavior, risk, and exact validation.

Never commit credentials, `.env` files, personal data, sensitive images, build
outputs, or copied provider responses containing identifiers.

## Public Claims and Civic Data

Changes involving budgets, municipalities, law, public services, privacy,
security, or AI accuracy require primary-source evidence. Include the exact
source URL, publisher, retrieval or extraction date, query/methodology, field
definitions, transformation steps, freshness limits, and validation evidence.

Do not present desired behavior as implemented behavior. Sample data must be
deterministic, visibly labeled, and incapable of being mistaken for citizen
activity, official status, or public-sector evidence.

Use the private process in [SECURITY.md](SECURITY.md) for vulnerabilities. This
project provides civic information and software, not legal advice.
