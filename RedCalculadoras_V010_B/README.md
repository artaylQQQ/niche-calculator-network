# Red de Calculadoras Nicho — Plantilla (V010)

**Documentación en español**. El sitio público y el contenido (páginas, JSON-LD) se publican en **inglés**.

## Archivos clave
- `START_AQUI.md`: guía clic-a-clic para lanzar (GitHub, Vercel, Dominio, Cron, Ads).
- `INSTRUCCIONES_DEL_PROYECTO.md`: objetivos, arquitectura, SEO/Ads/Legal, automatización.
- `PLAN_OPERATIVO.xlsx`: GANTT, CHECKLIST, BUDGET, KPI_TRACKER, ASSUMPTIONS.
- Código: `src/pages/calculators/` (calculadoras MDX), `scripts/generate_calcs.js` (publicación),
  `data/calculators.json` / `data/content_plan.csv` (inventario), `.github/workflows/nightly.yaml` (cron).

## Pasos rápidos
1. **Sube el proyecto** a GitHub (no subas el ZIP, sube su contenido).
2. **Despliega en Vercel** (Astro + Node 20). Configura `SITE_URL` (temporal .vercel.app).
3. **Dominio**: añade en Vercel y apunta DNS. Actualiza `SITE_URL` y redeploy.
4. **Automatiza**: Deploy Hook + Secrets (`VERCEL_DEPLOY_HOOK_URL`, `SITE_URL`, `MAX_PER_DAY=50`).
5. **Analítica/Ads**: Cloudflare Web Analytics (token) y AdSense tras aprobación.
6. **Operación** (6 h/semana): ampliar `data/calculators.json`, QA/SEO, métricas en el Excel.

## Coherencia V010
- ZIP referido como **RedCalculadoras_V010.zip**.
- Cron: **`30 1 * * *`** (01:30 UTC).
- Interlinking automático: **6** enlaces (sin autoenlace).
- Calculadoras en **`src/pages/calculators/`** (sin duplicar en `content/`).
