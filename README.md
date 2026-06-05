# Amazon Pipelines Documentation Site

VitePress documentation portal for the [Amazon Pipelines](../amazon-pipelines/) platform.

## Commands

```bash
npm install
npm run dev      # Local preview at http://localhost:5173
npm run build    # Production build to docs/.vitepress/dist
npm run preview  # Preview production build
npm run check    # Build validation (same as build)
```

## Structure

- `docs/` — Markdown content
- `docs/.vitepress/` — VitePress configuration and theme

The live API OpenAPI docs remain at the deployed Cloud Run service `/docs` endpoint.
