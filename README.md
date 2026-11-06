# cigol.dev

A collection of small, fast, browser-based tools for developers, designers and
researchers. Everything runs locally in your browser — no sign-up, no upload.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4**
- Static export (`output: 'export'`), hosted on **Cloudflare Pages**

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run type-check # tsc --noEmit
npm run build      # outputs to out/
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static export and uploads `out/` to the Cloudflare Pages project `cigol`.

## Project layout

```
src/app/            routes, layout, metadata
src/app/components/ UI components
```
