// astro.config.mjs
import { defineConfig } from "astro/config";

/**
 * Carga integraciones de forma segura (opcional):
 * si el paquete no está instalado, se omite sin fallar el build.
 */
const integrations = [];

async function safeAdd(pkgName, makeIntegration) {
  try {
    const mod = await import(pkgName);
    const integration = makeIntegration(mod.default);
    integrations.push(integration);
  } catch {
    // Paquete no instalado: lo omitimos en silencio
  }
}

// Tailwind (si está instalado)
await safeAdd("@astrojs/tailwind", (tw) => tw({ applyBaseStyles: true }));
// MDX (si está instalado)
await safeAdd("@astrojs/mdx", (mdx) => mdx());
// Sitemap desactivado: existe un generador personalizado en src/pages/sitemap.xml.ts
// await safeAdd('@astrojs/sitemap', (sitemap) => sitemap());

export default defineConfig({
  // URL pública FINAL del sitio (requerida para canónicos y sitemap)
  site: "https://www.calcsimpler.com",
  // Mantiene URLs sin barra final, coherente con las rutas visibles en producción
  trailingSlash: "never",
  integrations,
});
