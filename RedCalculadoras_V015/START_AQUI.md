# START_AQUI — Guía única (V015)

**Propósito:** lanzar una **Red de Calculadoras** (sitio en **inglés**) con **publicación programática** (20–100 páginas/día) y **sin soporte**.  
**Tu guía está en español** (este archivo). **El sitio** renderiza en **inglés**.

## Paso 1 — Sube el proyecto (GitHub)
1. Descarga **RedCalculadoras_V015.zip** y **descomprime**.
2. GitHub → **New repository** (público) → *sin* README/.gitignore/licencia.
3. En el repo → **Add file → Upload files** → arrastra **el contenido** de la carpeta (no el .zip).
4. Verifica que existen: `package.json`, `astro.config.mjs`, `src/`, `public/`, `scripts/`, `.github/`, `data/`, `meta/`.
5. **Commit changes**.

## Paso 2 — Despliega (Vercel)
1. Vercel → **New Project → Import** tu repo → Framework: **Astro** (auto).  
2. Si te faltan comandos: Build=`npm run build`, Install=`npm install --no-audit --no-fund`, Output=`dist`.  
3. **Environment Variables**:  
   - `SITE_URL` = `https://<tu-dominio-o-tu-url-de-vercel.app>` (Production, Preview)  
   - `VITE_CF_ANALYTICS_TOKEN` (opcional)  
   - `VITE_ADSENSE_CLIENT` (tras aprobación)  
4. **Deploy** y visita tu URL (tipo `*.vercel.app`).

## Paso 3 — Dominio
1. Compra un .com económico (Namecheap/Porkbun).  
2. Vercel → Project → **Settings → Domains → Add** → copia DNS (A 76.76.21.21 / CNAME www).  
3. Aplica en tu registrador → **Verify** en Vercel → candado SSL.  
4. Actualiza `SITE_URL` y **Redeploy**.

## Paso 4 — Automatiza (01:30 UTC)
1. Vercel → **Deploy Hooks (Production)** → copia URL.  
2. GitHub → **Settings → Secrets → Actions**:  
   - `VERCEL_DEPLOY_HOOK_URL`  
   - `SITE_URL`  
   - `MAX_PER_DAY` (40–60 inicio; 80–100 si indexa bien)  
3. Actions → **Run workflow** (prueba) → al día siguiente verás la corrida automática.

## Paso 5 — Analítica y Ads
1. Cloudflare Web Analytics → pega `VITE_CF_ANALYTICS_TOKEN` en Vercel → **Redeploy**.  
2. Solicita **AdSense** con ≥100–300 páginas indexadas → añade `VITE_ADSENSE_CLIENT` y tu `pub-...` en `/public/ads.txt` → **Redeploy**.

## Paso 6 — Datos y generación
- `data/calculators.json` (30 seeds, estilo seguro).  
- `scripts/generate_calcs.js` genera hasta **MAX_PER_DAY** MDX en `src/pages/calculators/` y mantiene `meta/publish_log.json` (no duplica).

## Paso 7 — Rutina 6 h/semana (resumen)
- **Contenido (2h):** añade 150–300 filas a `data/calculators.json`.  
- **QA (1.5h):** abre 3 páginas nuevas y verifica cálculo/FAQ.  
- **SEO (1h):** Search Console (cobertura) + related por clúster.  
- **Métricas (1h):** Cloudflare/AdSense.  
- **Mejora (0.5h):** duplica clúster ganador.

---

## Variables exactas
- **Vercel:** `SITE_URL`, `VITE_CF_ANALYTICS_TOKEN`, `VITE_ADSENSE_CLIENT`  
- **GitHub Actions:** `SITE_URL`, `VERCEL_DEPLOY_HOOK_URL`, `MAX_PER_DAY`

