# Contributing to Donde Esta Mi Plata

Thank you for your interest in contributing. This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Google Gemini API Key](https://aistudio.google.com/apikey)
- [Supabase Project](https://supabase.com/) (for budget data)

### Local Development

```bash
git clone https://github.com/JDRV-space/donde-esta-mi-plata.git
cd donde-esta-mi-plata
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

The development server runs at `http://localhost:3000` with hot reload.

## How to Contribute

### Reporting Bugs

Use the [Bug Report](https://github.com/JDRV-space/donde-esta-mi-plata/issues/new?template=bug_report.md) template to file an issue.

### Suggesting Features

Use the [Feature Request](https://github.com/JDRV-space/donde-esta-mi-plata/issues/new?template=feature_request.md) template to propose a feature.

### Submitting Code

1. **Fork** the repository
2. **Create** a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make** your changes
4. **Verify** no TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
5. **Test** locally with `npm run dev`
6. **Commit** with a clear message:
   ```bash
   git commit -m "Add your feature description"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/your-feature
   ```
8. **Open** a Pull Request against `main`

## Code Guidelines

- Follow TypeScript best practices
- Use functional React components with hooks
- Keep components focused and single-responsibility
- Write clear commit messages describing *what* and *why*

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `components/` | React UI components |
| `services/` | External API integrations (Gemini, Supabase, BCRP) |
| `utils/` | Shared utility functions |

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
