# INSTRUCCIONES_DEL_PROYECTO — Especificación completa y auto-contenida (v2025-08-16)

> **Regla de oro:** *Si algo no está en este documento, no se hace.*
> **Idioma:** Esta guía está en **español** para ti. El **sitio y todo su contenido público** va en **inglés**.
> **Horario:** Todos los cron/horarios en **UTC**.
> **No soporte:** Proyecto 100% digital, **sin soporte** al cliente, sin devoluciones.

---

## INSTRUCCIÓN PRINCIPAL (OBLIGATORIA)

**Crear una RED DE CALCULADORAS (Niche Calculator Network)**: un sitio web en **inglés**, con cientos/miles de calculadoras generadas y publicadas de forma **programática** (**20–100 páginas/día**), **sin soporte al cliente**, monetizado con **Ads** (y afiliados opcionales), y operable por una persona **sin conocimientos previos** siguiendo esta guía y `START_AQUI.md`.

## 0) Principios de diseño **para principiantes (sin conocimientos previos)**
- Diseñado para alguien **sin experiencia** en programación, web, publicidad ni negocios.
- Operable con **6 h/semana**, presupuesto inicial **≤ USD $200** (solo dominio). Todo lo demás en plan **Free**.
- Ruta **NO-CODE** por defecto (Vercel + GitHub + Cloudflare). LOW-CODE solo como anexo.
- **Sitio en inglés** (páginas, JSON-LD, etiquetas). **Documentación en español** (este archivo y START_AQUI.md).
- Debe existir **un único tutorial clic-a-clic**: `START_AQUI.md`. Esta guía es el **contrato técnico**.
- **Privacidad y seguridad:** sin cuentas, sin PII, analytics sin cookies.

---

## 1) Resumen ejecutivo (1 página)
**Qué:** Red de calculadoras útiles (porcentajes, finanzas, conversiones, negocio, web).
**Cómo:** Astro SSG (estático) + cálculos **client-side** + generación diaria por **GitHub Actions** + Deploy Hook a Vercel.
**Por qué funciona:** búsquedas evergreen, CWV>90, JSON-LD, interlinking, crecimiento constante.
**Riesgos:** indexación lenta (mitigar con hubs + sitemaps + enlaces), RPM variable (priorizar clústeres con mejor monetización), aprobación AdSense (requisitos).
**Objetivos 30/90/180 días:**
- **30 días:** repo+Vercel, dominio, cron activo, 1,200–1,800 páginas publicadas, sitemap enviado.
- **90 días:** 4k–8k páginas publicadas, solicitud AdSense (si no antes), primeros ingresos.
- **180 días:** 8k–15k páginas publicadas, optimización por clústeres, elevar MAX_PER_DAY a 80–100 si indexa bien.

---

## 2) Alcance, idioma, presupuesto y restricciones
- **Sitio y contenido** público: **inglés (US)**, sin sesgo de país.
- **Documentación**: español.
- **Presupuesto inicial:** **≤ $200** (dominio). Hosting (Vercel), GitHub, Cloudflare **Free**.
- **100% digital**: sin productos físicos, **sin soporte**, **sin devoluciones**.
- **Contenido**: IA/CC0/dominio público; **sin marcas registradas** ni obras con copyright.
- **Privacidad**: sin cuentas de usuario ni PII; Cloudflare Web Analytics (sin cookies).

---

## 3) Arquitectura NO-CODE (ruta por defecto) y LOW-CODE (anexo)
**NO-CODE (usar por defecto):**
- **Hosting**: Vercel (Free).
- **Repo**: GitHub público (subida por arrastrar/soltar).
- **Automatización**: GitHub Actions (cron 01:30 **UTC**) + Deploy Hook a Vercel.
- **Analítica**: Cloudflare Web Analytics (token).
- **Ads**: AdSense (script + `ads.txt`).
- **Generación**: `scripts/generate_calcs.js` → crea 20–100 `*.mdx`/día desde `data/`.

**LOW-CODE (opcional futuro):**
- Páginas “hub” por clúster, prompts IA para enriquecer intros/FAQs (no requerido).

---

## 4) Estructura de repositorio (qué es cada carpeta)
```
/src/layouts/              -> BaseLayout.astro (SEO, estilos, Ads y Analytics)
/src/components/           -> Calculator.astro (cálculos client-side + JSON-LD)
/src/pages/                -> index, privacy, disclaimer, 404 (todas en inglés)
/src/pages/calculators/      -> MDX generado (1 archivo por calculadora)
/scripts/                  -> generate_calcs.js (20–100/día), health_check.js (opcional)
/public/schema/            -> plantillas JSON-LD (FAQ, SoftwareApplication)
/data/                     -> calculators.json (semillas) y content_plan.csv (plan)
/meta/                     -> publish_log.json (lo crea el generador)
/.github/workflows/        -> nightly.yaml (cron 01:30 UTC)
START_AQUI.md              -> tutorial paso a paso (ES)
INSTRUCCIONES_DEL_PROYECTO.md -> este documento (ES)
PLAN_OPERATIVO.xlsx        -> Gantt + Checklist + Budget + KPIs (ES)
```

---

## 5) Variables/secretos — nombres exactos y dónde pegarlos
**Vercel → Project → Settings → Environment Variables**
- `SITE_URL` = `https://tudominio.com`
- `VITE_CF_ANALYTICS_TOKEN` = *token Cloudflare* (opcional al inicio)
- `VITE_ADSENSE_CLIENT` = `ca-pub-XXXXXXXXXXXXXXX` (tras aprobación)
- `VITE_ADSENSE_SLOTHEADER` = *(opcional)*

**GitHub → Repo → Settings → Secrets and variables → Actions**
- `SITE_URL` = `https://tudominio.com`
- `VERCEL_DEPLOY_HOOK_URL` = *URL del Deploy Hook (Production) de Vercel*
- `MAX_PER_DAY` = `50` (usa 40–60 al inicio; 80–100 si indexa bien)
- `OPENAI_API_KEY` = *(opcional; NO requerido para operar)*

---

## 6) Tutorial completo (clic-a-clic) — **auto-contenido aquí**
> (Duplicado de `START_AQUI.md` para que este archivo sea suficiente por sí solo)

**A. Subir el proyecto (GitHub)**
1. Ve a **github.com → New** → *Repository name:* `niche-calculator-network` → **Public → Create**.
2. Click **Add file → Upload files**.
3. Descomprime el ZIP y **arrastra todos los archivos y carpetas** (no subas el ZIP).
4. **Commit changes**.

**B. Desplegar (Vercel)**
1. **vercel.com → New Project → Import** tu repo.
2. Deja **Astro** autodetectado.
3. En **Environment Variables**, añade (puede ser luego): `SITE_URL`, `VITE_CF_ANALYTICS_TOKEN` (opcional), `VITE_ADSENSE_CLIENT` (post-aprobación).
4. **Deploy** y abre la URL de preview.

**C. Conectar dominio (≤ $15)**
1. **Vercel → Project → Settings → Domains → Add** tu dominio.
2. Sigue instrucciones DNS y espera propagación.

**D. Automatizar (cron 01:30 UTC)**
1. **Vercel → Settings → Deploy Hooks → Create Hook (Production)** → **copy URL**.
2. **GitHub → Settings → Secrets → Actions → New**:
   - `VERCEL_DEPLOY_HOOK_URL` (pega la URL)
   - `SITE_URL` (`https://tudominio.com`)
   - `MAX_PER_DAY` (`50`)
3. **GitHub → Actions → Nightly programmatic publish → Run workflow** (primera vez).
   - Hace: **generate → commit → llamar hook → ping sitemaps**.

**E. Analítica y Ads**
- **Cloudflare Web Analytics**: **dash.cloudflare.com/web-analytics** → **Add site** → copia token → pon `VITE_CF_ANALYTICS_TOKEN` en Vercel → **Redeploy**.
- **AdSense**: solicita con **≥100–300** páginas útiles + páginas legales. Tras aprobar, pon `VITE_ADSENSE_CLIENT` y actualiza `/public/ads.txt`.

**F. Operación semanal (6 h/semana)**
- **2 h Contenido**: añade 150–300 filas nuevas a `data/calculators.json`.
- **1.5 h QA/Release**: ejecuta workflow si hace falta; revisa 3 páginas nuevas.
- **1 h SEO**: Search Console (cobertura, errores), interlinking por clúster.
- **1 h Métricas**: Cloudflare (PV/sesiones), RPM cuando haya Ads.
- **0.5 h Mejora**: prioriza clústeres con mejor CTR/RPM.

---

## 7) Flujo de publicación (cron) — YAML listo
```yaml
name: Nightly programmatic publish
on:
  schedule:
    - cron: "30 1 * * *"  # 01:30 UTC
  workflow_dispatch:
permissions:
  contents: write
env:
  SITE_URL: ${{ secrets.SITE_URL }}
  MAX_PER_DAY: ${{ secrets.MAX_PER_DAY }}
jobs:
  generate-build-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: Install deps
        run: npm i --no-audit --no-fund
      - name: Generate calculators
        env:
          MAX_PER_DAY: ${{ env.MAX_PER_DAY }}
        run: npm run generate
      - name: Commit & push if changed
        run: |
          git config user.name "gh-bot"
          git config user.email "gh-bot@users.noreply.github.com"
          git add -A
          if ! git diff --cached --quiet; then
            git commit -m "chore: publish $(date -u +'%Y-%m-%d')"
            git push
          else
            echo "No changes to commit."
          fi
      - name: Trigger Vercel Deploy Hook
        if: ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
        run: curl -s -X POST "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"
      - name: Ping sitemaps
        if: ${{ env.SITE_URL }}
        run: |
          curl -s "https://www.google.com/ping?sitemap=${ env.SITE_URL }/sitemap-index.xml" || true
          curl -s "https://www.bing.com/ping?sitemap=${ env.SITE_URL }/sitemap-index.xml" || true
```

---

## 8) Modelo de datos (JSON) + ejemplo completo
```json
{
  "slug": "percentage-discount-calculator",
  "title": "Percentage Discount Calculator",
  "locale": "en",
  "inputs": [
    {"name":"price","type":"number","min":0,"step":0.01,"hint":"Original price"},
    {"name":"discount","type":"number","min":0,"max":100,"step":0.1,"hint":"Discount (%)"}
  ],
  "expression": "price*(1-discount/100)",
  "units": {"input":"","output":""},
  "intro": "Calculate the discounted price and see the math.",
  "examples": [{"input":{"price":100,"discount":15},"output":"85"}],
  "faqs": [{"q":"How is the discount calculated?","a":"We apply price × (1 − discount/100)."}],
  "related": ["percentage-increase-calculator","percentage-change-calculator"],
  "disclaimer": "Educational information, not professional advice.",
  "schema_org": "FAQPage|SoftwareApplication",
  "cluster": "Percentages & Ratios"
}
```
> Usa **`expression`** *o* **`formula_js`** (función pura determinista `inputs => {result, steps}`).

---

## 9) SEO programático (JSON-LD, sitemaps, interlinking, CWV)
- **JSON-LD — SoftwareApplication** (por calculadora):
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Percentage Discount Calculator",
  "applicationCategory": "Calculator",
  "operatingSystem": "Any",
  "url": "https://yourdomain.com/calculators/percentage-discount-calculator/",
  "description": "Calculate the discounted price and see the math."
}
```
- **JSON-LD — FAQPage** (si hay FAQs):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is the discount calculated?",
      "acceptedAnswer": {"@type":"Answer","text":"We apply price × (1 − discount/100)."}
    }
  ]
}
```
- **Sitemaps**: integrados con `@astrojs/sitemap` → `sitemap-index.xml`.
- **Interlinking**: el generador asigna `related` del mismo clúster (8 enlaces).
- **CWV >90**: HTML/CSS mínimo, sin dependencias pesadas, JS solo para cálculo, imágenes mínimas, 1 slot de anuncio.

---

## 10) Plan inicial de contenido
- Incluido: `data/calculators.json` (**150** seeds) y `data/content_plan.csv` (**640** ideas; 8 clústeres × 80).
- No necesitas abrirlos para empezar: con el cron ya publicas lotes diarios.
- **Sugerencia**: Prioriza clústeres de mayor RPM (Finance & Loans, Business, Web & Marketing).

**Mini-tabla (ejemplos en inglés)**
| Cluster | Suggested slug | One-liner |
|---|---|---|
| Finance & Loans | `loan-payment-calculator` | Fixed monthly loan payment. |
| Percentages & Ratios | `percentage-increase-calculator` | Compute percent increase. |
| Conversions & Units | `miles-to-kilometers-converter` | Convert miles to km. |
| Health & Fitness | `bmi-calculator` | Estimate BMI. |

---

## 11) Monetización (sin soporte)
**Ads (AdSense)**
- **Requisitos** típicos de aprobación: ≥100–300 páginas útiles, contenido original, páginas **Privacy** y **Disclaimer**, navegación clara, sin contenido restringido.
- **Dónde pegar**: el script de AdSense ya está en `BaseLayout.astro` (mediante `VITE_ADSENSE_CLIENT`).
- **ads.txt**: ajusta `public/ads.txt` con tu `pub-...`.
- **Placement seguro**: **1 slot** dentro de cada calculadora (ya añadido en `Calculator.astro`), debajo del resultado.

**Afiliados (opcionales)**
- Redes globales (sin soporte), CTAs discretos debajo del resultado; **no saturar**.

---

## 12) Legal & compliance (no expertos)
- **Contenido**: fórmulas genéricas (dominio público) + texto propio/IA.
- **Disclaimer exacto (en inglés, ya en /disclaimer):**
  “**All calculators and outputs are for educational and informational purposes only and are not professional advice.**”
- **Privacidad**: Cloudflare Web Analytics (sin cookies).
- **Accesibilidad**: labels, `aria-live` (objetivo WCAG AA).

---

## 13) Operación casi automática (6 h/semana) y health checks
- **Ritual semanal**: 2h contenido, 1.5h QA/Release, 1h SEO, 1h métricas, 0.5h mejora.
- **Health checks**:
  - `npm run generate` local (opcional) → verifica creación de MDX.
  - Revisa `meta/publish_log.json` (creado/actualizado).
  - GitHub Actions → históricos/verdes.
  - Cloudflare → sesiones/PV por página.
- **Backups**: el repo GitHub es el backup (código + contenido).

**Árbol de decisión (resumen)**
- **No se generaron páginas hoy** → mira `MAX_PER_DAY`, formato de `data/calculators.json`, logs de Actions.
- **Build ok, sin deploy** → revisa Deploy Hook (URL y secretos).
- **PV bajos** → mejora interlinking, crea hubs, sube `MAX_PER_DAY` si indexa bien, prioriza clústeres ganadores.
- **RPM bajo** → mueve tráfico a Finance/Business/Web; optimiza títulos/meta.

---

## 14) Troubleshooting (pasos concretos)
- **Build falla**: abre Actions → detalle del job → corrige error (JSON mal formateado en `data/`, o Node versión) → reintenta.
- **Cron no corre**: verifica que el workflow esté **Enabled**, revisa historial; si no hay run, dispara **workflow_dispatch** manualmente.
- **Ads rechazados**: confirma Privacy/Disclaimer, reduce densidad de anuncios (1 slot), elimina contenido restringido, solicita revisión.
- **Páginas sin indexar**: `sitemap-index.xml` enviado, crea hubs por clúster, añade FAQs, mejora intros, aumenta velocidad de publicación gradualmente.

---

## 15) Prompts de IA listos (en español; salida en inglés) — 3 variantes
**A. Intro (tone: clear, helpful, 60–90 words)**
1) “Write a concise introduction for a calculator titled ‘{title}’. Explain what it computes, inputs required ({inputs}), and when to use it. Avoid fluff.”
2) “In 3–4 sentences, introduce the ‘{title}’. Mention accuracy, step-by-step output, and a generic use case.”
3) “Create a neutral US English intro for ‘{title}’. Emphasize instant results, privacy, and no sign‑up.”

**B. Examples (JSON)**
1) “Return 2 realistic example objects for {title} with ‘input’ and ‘output’ fields. Keep numbers sensible.”
2) “Generate 3 example cases for {title} showing edge, normal, and large values. JSON only.”
3) “Provide 2 minimal examples for {title} focusing on typical user inputs.”

**C. FAQs (3–5 Q&A)**
1) “Write 4 FAQs for a calculator called ‘{title}’. Avoid legal/medical advice; educational only.”
2) “Provide 3 FAQs about accuracy, rounding and limitations for {title}.”
3) “Create 5 concise FAQs clarifying formula, units and common mistakes for {title}.”

**D. Titles (H1)**
1) “Write 5 H1 title variants for a calculator named ‘{keyword}’ (US English, <60 chars).”
2) “Provide 5 SEO-friendly titles including the main keyword: {keyword}.”
3) “Suggest 5 natural titles for {keyword} avoiding clickbait.”

**E. Meta descriptions (<155 chars)**
1) “Write 5 meta descriptions for {keyword} (US English, 140–155 chars).”
2) “Provide 5 concise metas highlighting inputs and instant result for {keyword}.”
3) “Create 5 metas for {keyword} mentioning privacy-friendly and ad-supported.”

**F. Image alt (accessibility)**
1) “Write 3 alt texts describing the input form and result area for {title}.”
2) “Provide 3 alt attributes focusing on user action (enter values, press calculate).”
3) “Create 3 alt lines referencing units used by {title}.”

**G. Internal links (cluster interlinking)**
1) “List 8 slugs of related calculators within the ‘{cluster}’ cluster for {title}.”
2) “Suggest 10 internal links mixing cluster peers and 2 cross-cluster calculators.”
3) “Provide 6 related slugs prioritizing long-tail variations of {title}.”

---

## 16) Plan de crecimiento hacia $1M (matemática transparente)
**Ingresos = (Pageviews/1,000) × RPM (+ eRPM afiliados).**

| Escenario | RPM | PV/año para $1M | PV/día |
|---|---:|---:|---:|
| Ads-only (bajo) | $6  | 166.7M | 456.6k |
| Ads-only (medio) | $12 | 83.3M  | 228.3k |
| Ads-only (alto) | $20 | 50.0M  | 137.0k |
| Ads-only (alto+) | $25 | 40.0M  | 109.6k |

**Mixto (ejemplo):** RPM Ads $12 + eRPM afiliados $3 ⇒ **$15** total.
- Con 36.5k páginas/año a 50% indexadas y 50 PV/mes por página → ~912k PV/mes (≈30k/día) → **$13.7k/mes** a $15.

---

## 17) KPIs & dashboard (qué medir y metas)
- **Semanal**: páginas publicadas, indexadas, PV, RPM, ingresos, CTR, páginas/sesión, horas reales.
- **Metas iniciales**: indexación ≥40–60%, PV/página/mes 40–60, RPM \$10–\$15.
- **Herramienta**: `PLAN_OPERATIVO.xlsx` (ya incluye hojas GANTT, CHECKLIST, BUDGET, REVENUE, KPI_TRACKER).

---

## 18) Checklist de 7 días (de cero a producción)
**Día 1 (60 min)**: GitHub repo (subir todo), Vercel import, primer deploy.
**Día 2 (45 min)**: Dominio en Vercel; `SITE_URL` en Vercel; crear Deploy Hook.
**Día 3 (30 min)**: Secrets en GitHub (`VERCEL_DEPLOY_HOOK_URL`, `SITE_URL`, `MAX_PER_DAY=50`).
**Día 4 (20 min)**: Ejecutar Actions manualmente (primer batch).
**Día 5 (30 min)**: Cloudflare Web Analytics (token) en Vercel; redeploy.
**Día 6 (30 min)**: Sitemap en GSC; revisar cobertura.
**Día 7 (60 min)**: QA 3 páginas; ajustar `MAX_PER_DAY` si todo ok; registrar KPIs en Excel.

---

## 19) Compliance final y recordatorios
- **No soporte / No devoluciones**: el sitio es autoexplicativo con FAQs y disclaimer.
- **Contenido**: fórmulas públicas + texto original; evita marcas registradas.
- **Privacidad**: sin PII; sin cookies propias; Cloudflare sin cookies.
- **Operación**: si algo falla, revisa Troubleshooting (sección 14).

**Fin del documento.**
