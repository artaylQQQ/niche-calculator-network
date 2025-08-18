# INSTRUCCIONES_DEL_PROYECTO (V016)

- Web en **inglés**, documentación en **español**.
- Cálculo client-side, sin soporte, SEO programático.
- Publicación programática: **20–100** páginas/día (cron **30 1 * * ***).

## Estructura
- Calculadoras: `src/pages/calculators/*.mdx` (una por archivo).
- Interlinking automático: **6** relacionados.
- Datos seed: `data/calculators.json` (30).

## Flujo
1) Generación (`scripts/generate_calcs.js`) → MDX en `src/pages/calculators/`.
2) Build & Deploy (Vercel).
3) Sitemaps ping (Google/Bing).
