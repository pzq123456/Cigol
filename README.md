# cigol.dev

A collection of small, fast, browser-based tools for developers, designers and
researchers. Everything runs locally in your browser — no sign-up, no upload.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- Static export (`output: 'export'`), hosted on **Cloudflare Pages**

## Tools

Every tool is registered in `src/tools/registry.ts` and runs fully in the
browser — no backend, no uploads.

| Tool | Category |
| --- | --- |
| CSV to Markdown Table Generator | dev |
| CSS Clamp Calculator | dev |
| Compress Image Under 100KB | image |
| YouTube Thumbnail Compressor (2MB) | image |
| Etsy Listing Image Resizer (2000×2000) | image |
| Rubik's Cube (3D, auto-solve) | fun |

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
src/app/            routes, layout, metadata, robots, sitemap
src/app/components/ shared UI components (Footer, ToolCard, ThemeToggle, …)
src/tools/          one folder per tool: <slug>/index.tsx + registry entries
src/tools/_lib/     pure helpers shared between tools
docs/seo/           keyword research notes
.github/workflows/  Cloudflare Pages deploy pipeline
```
