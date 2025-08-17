# START_AQUI — Guía única para lanzar (6 h/semana, presupuesto ≤ $200)

**Propósito:** lanzar una **Red de Calculadoras Nicho** 100% digital (sitio en **inglés**), con **publicación programática** (20–100 páginas/día) y **sin soporte**.
**Tus instrucciones están en español** (este archivo). **El sitio y su contenido** (páginas/JSON-LD) están en **inglés**.

---

## Paso 1 — Sube el proyecto (GitHub) (clic-a-clic para principiantes)

**Objetivo:** crear un repositorio público en GitHub y subir **el contenido del ZIP** (no el ZIP).
**Duración estimada:** 10–15 minutos.

### 1) Prepara los archivos en tu computador
1. Localiza el archivo **`RedCalculadoras_V011.zip`** en tu equipo.
2. **Descomprímelo**:
   - **Windows:** clic derecho → **Extract All…** → elige carpeta → **Extract**.
   - **macOS:** doble clic → se crea carpeta con el mismo nombre.
3. Abre la carpeta descomprimida.
   > ⚠️ **No** vas a subir el `.zip`. Subirás **lo de adentro** (archivos y carpetas).

### 2) Crea el repositorio en GitHub
1. Abre **https://github.com** e inicia sesión.
2. Arriba a la derecha, haz clic en **“+” → New repository**.
3. Completa:
   - **Repository name:** `niche-calculator-network` (o el nombre que prefieras).
   - **Visibility:** **Public**.
   - Deja sin marcar “Add a README”, “Add .gitignore”, “Choose a license”.
4. Pulsa **Create repository** (se abrirá el repo vacío).

### 3) Sube el contenido del proyecto (arrastrar y soltar)
1. En el repo, haz clic en **Add file → Upload files**.
2. En tu computador, dentro de la carpeta descomprimida, presiona **Ctrl/⌘ + A** para **seleccionar todo** (archivos y carpetas).
3. **Arrastra** esa selección a la ventana del navegador (área de subida de GitHub).
   - GitHub acepta **carpetas completas** (incluida **`.github/`**).
   - Si tu navegador **no** deja arrastrar carpetas, usa el **Plan B** de abajo.
4. En **Commit changes**, escribe un mensaje: `init: upload V011` → **Commit changes**.
   > ⏳ Según tu conexión, puede tardar. No cierres la pestaña hasta ver el commit creado.

### 4) Verifica que todo quedó correctamente
En la **raíz del repo** (pestaña **Code**) debes ver:

- **Archivos:** `package.json`, `astro.config.mjs`, `START_AQUI.md`, `INSTRUCCIONES_DEL_PROYECTO.md`, `PLAN_OPERATIVO.xlsx`
- **Carpetas:** `src/`, `public/`, `scripts/`, `.github/`, `data/`, `meta/`
  - Dentro de **`src/pages/calculators/`** deben existir archivos **`.mdx`** (≥2 de ejemplo).
  - Dentro de **`.github/workflows/`** debe estar **`nightly.yaml`** (cron).
  - **Opcional:** puede existir `content/` (no afecta: las rutas públicas las sirve `src/pages/calculators/`).

**Árbol orientativo**
```
/ (raíz)
├─ package.json
├─ astro.config.mjs
├─ START_AQUI.md
├─ INSTRUCCIONES_DEL_PROYECTO.md
├─ PLAN_OPERATIVO.xlsx
├─ src/
│  ├─ layouts/
│  ├─ components/
│  └─ pages/
│     └─ calculators/
│        ├─ percentage-discount-calculator.mdx
│        └─ loan-payment-calculator.mdx
├─ public/
├─ scripts/
│  └─ generate_calcs.js
├─ .github/
│  └─ workflows/
│     └─ nightly.yaml
├─ data/
│  ├─ calculators.json
│  └─ content_plan.csv
└─ meta/
```

### 5) Habilita GitHub Actions (solo confirmar)
1. Abre la pestaña **Actions**.
2. Si aparece *“Workflows aren’t being run for this repository”*, pulsa **Enable / I understand, enable**.
3. Verás el workflow **Nightly programmatic publish** (se ejecutará en el **Paso 4**).

**Plan B — si no te deja arrastrar carpetas**
- **GitHub Desktop (recomendado):** `File → New repository` → copia dentro **todo** el contenido descomprimido → **Commit to main** → **Push origin**.
- **Desde la web:** **Add file → Create new file** y escribe `.github/workflows/nightly.yaml` (crea rutas). Pega el contenido → **Commit**. Repite si hace falta y luego usa **Upload files**.

**Errores comunes**
- Subir el `.zip` en vez del contenido → ❌.
- Carpetas anidadas de más (que `package.json` no quede en subcarpetas).
- Falta `/.github/workflows/nightly.yaml` → sin cron.
- No hay `.mdx` en `src/pages/calculators/` → no existen URLs `/calculators/{slug}/`.

**Señales de éxito**
- Estructura correcta en **Code**.
- Workflow visible en **Actions**.
- `.mdx` presentes en `src/pages/calculators/`.

---

## Paso 2 — Despliega (Vercel) (clic-a-clic)

**Objetivo:** conectar tu repo de GitHub a Vercel y obtener tu sitio online (primero en `*.vercel.app`).
**Duración:** 10–20 min.
**Resultado:** URL tipo `https://tu-proyecto.vercel.app`.

### A) Crea tu cuenta y conecta GitHub
1. Abre **https://vercel.com** → **Sign up** (o **Log in**).
2. **Continue with GitHub** y autoriza.
3. Scope: **Personal Account** (gratis). Si pide instalar la app, elige **Only select repositories** y selecciona tu repo.

### B) Importa tu repositorio
1. **New Project → Import Git Repository**.
2. Selecciona tu repo `niche-calculator-network` → **Import**.
3. **Configure Project**:
   - **Project Name:** deja sugerido.
   - **Framework Preset:** **Astro** (si no lo detecta, elígelo).
   - **Root Directory:** `/`.

### C) Ajustes de build (si Vercel no los autocompleta)
- **Build Command:** `npm run build`
- **Install Command:** `npm install --no-audit --no-fund`
- **Output Directory:** `dist`
- **Node.js Version:** `20.x`

### D) Variables de entorno (ahora o después)
Añade en **Environment Variables**:

| Name | Value | Environment |
|---|---|---|
| `SITE_URL` | `https://<tu-dominio-o-tu-url-de-vercel.app>` | Production, Preview |
| `VITE_CF_ANALYTICS_TOKEN` | (token Cloudflare, **opcional**) | Production, Preview |
| `VITE_ADSENSE_CLIENT` | `ca-pub-xxxxxxxxxxxxxxxx` (**solo tras aprobación**) | Production |
| `VITE_ADSENSE_SLOTHEADER` | (opcional) | Production |

> Si aún no tienes dominio, usa temporalmente la URL de Vercel como `SITE_URL`. Tras el **Paso 3**, cámbiala a `https://tudominio.com` y **Redeploy**.

### E) Lanza el primer deploy
1. Pulsa **Deploy**.
2. Revisa logs (debe verse **astro build** y **Build completed**).
3. Pulsa **Visit** → abre tu sitio.

### F) Verifica el sitio
1. Abre:
   - `/calculators/percentage-discount-calculator/`
   - `/calculators/loan-payment-calculator/`
2. Deben renderizar formulario, calcular y mostrar **Result** + **FAQ**.
3. En **Ctrl/⌘+U** (código fuente), confirma:
   - `<link rel="canonical" ...>` correcto (usa `Astro.site`).
   - Bloques `application/ld+json` de **SoftwareApplication** y **FAQPage**.

**Checklist del Paso 2**
- [ ] URL de Vercel activa.
- [ ] Calculadoras de ejemplo funcionan.
- [ ] `SITE_URL` configurado (temporal si no hay dominio).
- [ ] (Opcional) `VITE_CF_ANALYTICS_TOKEN` añadido y redeploy.
- [ ] **No** añadir `VITE_ADSENSE_CLIENT` hasta aprobación.

---

## Paso 3 — Dominio (≤ $15)

**Resumen:** **Vercel → Settings → Domains → Add** tu dominio y sigue las instrucciones de DNS.
**Tiempo:** 30–60 min + propagación (hasta 24 h).
**Costo:** ~USD 10–15/año (Namecheap / Porkbun / Google Domains).

### A) Compra tu dominio
- Registradores: `namecheap.com`, `porkbun.com`, `domains.google`.
- Ejemplos de nombre: `fastcalculators.com`, `smartcalcnetwork.com`.

### B) Añádelo en Vercel
- **Settings → Domains → Add** → escribe `midominio.com` → **Add**.
- Vercel te mostrará registros **A** / **CNAME**.

### C) Configura DNS en tu registrador
- **A** → `76.76.21.21` (Vercel).
- **CNAME** `www` → `cname.vercel-dns.com`.
- Elimina A/CNAME conflictivos. **Guarda**.

### D) Verifica y espera propagación
- En Vercel → **Domains** → **Verify**.
- Verde ✅ cuando propague (15 min a 24 h). SSL se emite automático (Let’s Encrypt).

### E) Actualiza `SITE_URL` y redeploy
- **Vercel → Settings → Environment Variables** → `SITE_URL = https://midominio.com` → **Save** → **Redeploy**.
- En **Ctrl/⌘+U**, canónica/JSON-LD deben usar tu dominio.

**Checklist del Paso 3**
- [ ] Dominio añadido en Vercel.
- [ ] DNS A/CNAME apuntan a Vercel.
- [ ] Verde ✅ en Domains (propagación).
- [ ] `SITE_URL` actualizado y redeploy.
- [ ] Canónica/JSON-LD con dominio propio.

---

## Paso 4 — Automatiza (cron 01:30 UTC)

**Objetivo:** que cada noche (01:30 **UTC**) el workflow:
1) Genere calculadoras (20–100/día), 2) haga build, 3) despliegue, 4) pinguee sitemaps.

**Duración inicial:** 20–30 min (luego es automático).

### A) Crea un Deploy Hook en Vercel
- **Settings → Git → Deploy Hooks → Create Hook**
  - **Name:** `nightly-deploy`
  - **Branch:** `main`
- Copia la **URL** del hook.

### B) Secrets en GitHub
- **Repo → Settings → Secrets and variables → Actions → New repository secret**
  - `VERCEL_DEPLOY_HOOK_URL` → (pega la URL del hook)
  - `SITE_URL` → `https://tudominio.com`
  - `MAX_PER_DAY` → `50` (sube a 80–100 cuando la indexación sea >60–70%)
  - `OPENAI_API_KEY` → (opcional)

### C) Revisa el workflow
- **Actions → Nightly programmatic publish** (archivo `.github/workflows/nightly.yaml`).
- Pasos: generar, commit, build, llamar hook, ping sitemaps.

### D) Prueba manual
- **Run workflow** (branch `main`) → revisa logs:
  - “Generate calculators” crea `.mdx`.
  - “Build” OK.
  - “Deploy hook” 200 OK.
  - “Ping sitemaps” OK.

### E) Confirmar el cron
- El YAML trae: `cron: '30 1 * * *'` → **01:30 UTC** diario.
- Conversión **referencial** (varía con DST):
  - **Nueva York (EDT)**: **21:30** del día anterior
  - **Los Ángeles (PDT)**: **18:30** del día anterior
  - **Madrid (CEST)**: **03:30** del mismo día
- No necesitas ajustar nada: el cron usa **UTC**.

**Checklist del Paso 4**
- [ ] Hook creado.
- [ ] Secrets (`VERCEL_DEPLOY_HOOK_URL`, `SITE_URL`, `MAX_PER_DAY`, `OPENAI_API_KEY` opcional).
- [ ] Ejecución manual OK.
- [ ] Ejecución automática al día siguiente.
- [ ] Nuevas URLs `/calculators/...` publicadas y `sitemap` actualizado.

---

## Paso 5 — Analítica y Ads

**Objetivo:** medir tráfico (Cloudflare) y activar ingresos (AdSense).
**Duración:** 30–45 min. **Costo:** gratis.

### A) Cloudflare Web Analytics (sin cookies)
1. **https://www.cloudflare.com/web-analytics/** → **Get Started Free**.
2. **Add a Website** → tu dominio.
3. Copia el **token** del snippet.
4. **Vercel → Settings → Environment Variables**:
   - `VITE_CF_ANALYTICS_TOKEN` = *tu token* (Production, Preview) → **Save** → **Redeploy**.
5. En **Ctrl/⌘+U**, verifica que el script aparece con **tu token**.

### B) Solicita Google AdSense
**Antes:** espera ≥100–300 páginas útiles **indexadas** (1–2 meses). Requisitos: dominio propio, contenido original, **Privacy** y **Disclaimer**.
1. **https://www.google.com/adsense/** → **Get Started** → completa datos del sitio.
2. AdSense puede tardar **3–14 días** en aprobar.

### C) Activa anuncios tras la aprobación
1. Recibirás un ID tipo `ca-pub-1234567890123456`.
2. En **Vercel → Environment Variables**:
   - `VITE_ADSENSE_CLIENT` = `ca-pub-...` (Production).
   - (Opcional) `VITE_ADSENSE_SLOTHEADER` = *slot id*.
3. Edita **`/public/ads.txt`**:
   ```
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```
4. **Commit** en GitHub → **Redeploy** en Vercel.
5. Los anuncios pueden tardar hasta **48 h** en mostrarse.

**Checklist del Paso 5**
- [ ] `VITE_CF_ANALYTICS_TOKEN` configurado + redeploy.
- [ ] Solicitud a AdSense enviada.
- [ ] Aprobación recibida.
- [ ] `VITE_ADSENSE_CLIENT` configurado.
- [ ] `public/ads.txt` actualizado.
- [ ] Anuncios visibles.

---

## Paso 6 — Datos incluidos

**Resumen**
- `data/calculators.json` → **150** calculadoras listas para publicar.
- `data/content_plan.csv` → **640** ideas por clúster (backlog).
- `scripts/generate_calcs.js` → genera **20–100** páginas/día + interlinking.

**Notas clave (V011)**
- El **generador** publica archivos **`.mdx` en `src/pages/calculators/`** (no en `content/`).
- El script usa **`data/calculators.json`** como **fuente**. El `content_plan.csv` es **backlog** (útil para que copies ideas a `calculators.json`).

**Flujo diario**
1. **01:30 UTC** → Actions ejecuta `generate_calcs.js`.
2. Publica **20–100** `.mdx` nuevos en `src/pages/calculators/`.
3. Commit automático → Hook Vercel → build → deploy.
4. `sitemap` actualizado para Google/Bing.

**Comprobar**
- **Actions**: ver “Published N calculators”.
- Web: nuevas URLs en `/calculators/...`.
- `sitemap.xml` actualizado.

---

## Paso 7 — Rutina 6 h/semana

**Objetivo:** crecer con 6 h/semana.
**Bloques:**
- **Contenido (2 h):** añade **150–300** entradas a `data/calculators.json`.
- **QA/Release (1.5 h):** ejecuta workflow si falta; valida 3 páginas nuevas.
- **SEO (1 h):** Search Console (cobertura/errores) + `related` internos.
- **Métricas (1 h):** Cloudflare (Sessions/PV) y, con Ads, **RPM**.
- **Mejora (0.5 h):** duplica clústeres con mejor CTR/RPM.

**Ritmo de publicación**
- Semanas **1–8**: `MAX_PER_DAY = 40–60`.
- Al superar **60–70%** de indexación sostenida: sube a **80–100**.

**Checklist semanal**
- [ ] +150 calculadoras en `calculators.json`.
- [ ] Workflow corrió.
- [ ] 3 calculadoras nuevas validadas.
- [ ] Search Console (cobertura + consultas).
- [ ] Métricas (Cloudflare/AdSense) registradas en Excel.
- [ ] Expandí el mejor clúster.

---

## Paso 8 — Un único archivo para gestionarlo todo

**Abre `PLAN_OPERATIVO.xlsx` cada semana** y actualiza:
- **GANTT** (tareas/fechas/estado).
- **CHECKLIST** (rutina 6 h).
- **BUDGET** (costos, `Variance = Actual - Planned`).
- **KPI_TRACKER** (páginas, indexación, sesiones, PV, RPM, ingresos).
- **ASSUMPTIONS** (supuestos y cambios fechados).

**Compárteme el Excel actualizado** para darte recomendaciones numéricas.

---

## Nombres exactos (variables / secrets)

**Vercel (Environment Variables):**
`SITE_URL`, `VITE_CF_ANALYTICS_TOKEN`, `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOTHEADER`

**GitHub Actions (Secrets):**
`SITE_URL`, `VERCEL_DEPLOY_HOOK_URL`, `MAX_PER_DAY`, `OPENAI_API_KEY` (opcional)

---

## Comandos locales (opcional)
> Requiere **Node.js 20+**. No es obligatorio; todo corre en la nube.

```bash
npm i --no-audit --no-fund     # Instalar dependencias
npm run dev                    # Desarrollo local (http://localhost:4321)
npm run generate               # Generar nuevas calculadoras (-> src/pages/calculators)
npm run build                  # Build de producción (dist/)
npm run preview                # Previsualizar el build
```

**Dónde ver resultados**
- Nuevos `.mdx` en `src/pages/calculators/`.
- Sitio local en `http://localhost:4321`.

**Errores típicos**
- “Node version too low” → instala Node 20.
- Error al generar → revisa JSON válido en `data/calculators.json`.
- 404 en rutas → confirma `.mdx` en `src/pages/calculators/`.

---

## Ritmo semanal con el Excel (mini-guía)

- **Lunes (30–45 min):** `KPI_TRACKER` + `CHECKLIST` (datos de Cloudflare / Search Console).
- **Mar–Mié (2 h):** +150–300 en `calculators.json`.
- **Jue (45 min):** QA de 3 calculadoras.
- **Vie (30 min):** SEO (cobertura + `related`).
- **Sáb (30 min):** Métricas: RPM/Revenue estimado.
- **Dom (15–30 min):** Mejora: clúster a duplicar.

**Para feedback:** sube `ops/PLAN_OPERATIVO.xlsx` o comparte enlace y escribe: “Semana 2025-W34 lista”.
