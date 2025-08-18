# INSTRUCCIONES_DEL_PROYECTO (V015)

- Red de calculadoras en **inglés** (cálculo client-side, sin soporte).
- Publicación programática **20–100 páginas/día** (cron 01:30 UTC).
- Hosting: Vercel (Astro + MDX). Analítica: Cloudflare. Ads: AdSense.
- SEO: sitemap, robots, JSON-LD en cada página (desde `schema`).
- Calidad: `.editorconfig`, Prettier; MDX “seguro” (sin HTML/JSX ambiguo).

## Rutas y convenciones
- Calculadoras: `src/pages/calculators/*.mdx` (una por archivo). **Sin** duplicados en `content/`.
- Interlinking automático: **6** relacionados.
- Cron YAML: `30 1 * * *` (01:30 UTC).
- `SITE_URL` obligatorio para canónicas correctas.

## Flujo programático
- `data/calculators.json` → `scripts/generate_calcs.js` → MDX en `src/pages/calculators/` → build → deploy → ping sitemaps.
- Log de publicación: `meta/publish_log.json` (evita duplicados).
