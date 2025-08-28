# START_AQUI — Guía única (V017)  

**Propósito:** lanzar una **Red de Calculadoras** (sitio en **inglés**) con **publicación programática** (20–100 páginas/día) y **sin soporte**.

## Paso 1 — Sube el proyecto (GitHub)
1. Descarga **RedCalculadoras_V017.zip** y descomprime.
2. Crea repo público (sin README/.gitignore/licencia).
3. **Upload files** → sube **el contenido** (no el ZIP).
4. Verifica: `package.json`, `astro.config.mjs`, `src/`, `public/`, `scripts/`, `.github/`, `data/`, `meta/`.
5. Commit a `main`.

## Paso 2 — Despliega (Vercel)
- Importa repo → Framework: **Astro**. Build:`npm run build` Output:`dist` si no lo autocompleta.
- Variables: `SITE_URL`, opcional `VITE_CF_ANALYTICS_TOKEN`, `VITE_ADSENSE_CLIENT` tras aprobación.

## Paso 3 — Dominio
- Añade dominio en Vercel → DNS (A 76.76.21.21 / CNAME www). Actualiza `SITE_URL` y **Redeploy**.

## Paso 4 — Automatiza (01:30 UTC)
- Deploy Hook (Production) en Vercel.
- Secrets en GitHub: `VERCEL_DEPLOY_HOOK_URL`, `SITE_URL`, `MAX_PER_DAY` (40–60 inicio).
- **Run workflow** (prueba).

## Paso 5 — Legal/SEO/Ads
- Páginas: `/privacy`, `/disclaimer` (en inglés).
- `robots.txt` con `Sitemap: /sitemap-index.xml`.
- `ads.txt`: reemplaza `pub-XXXXXXXXXXXXXXXXXXXXXXXX` al aprobar AdSense.

## Paso 6 — Generación
- `data/calculators.json` (30 seeds).
- `npm run generate` o cron nocturno (`.github/workflows/nightly.yaml`).
