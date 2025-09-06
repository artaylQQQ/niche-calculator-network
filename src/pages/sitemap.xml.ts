// src/pages/sitemap.xml.ts
// Sitemap sólido para Astro, con tolerancia a distintas fuentes de datos.
// - Cubre rutas estáticas (home, categorías, listados).
// - Cubre calculadoras desde Content Collections (getCollection('calculators')).
// - Fallbacks: escaneo de MDX en /src/content/calculators y /content/calculators,
//   y opcionalmente lectura de data/calculators.json si existe.
// - Deduplica slugs y nunca lanza el build por fallos de import: todo va envuelto en try/catch.

import type { APIContext } from "astro";
let getCollectionFn: undefined | ((...args: any[]) => Promise<any[]>);
let hasCalcCollection = false;
try {
  // Disponible si usas Content Collections
  // (no explota si no existe: el try/catch lo protege).
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mod = await import("astro:content");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getCollectionFn = mod.getCollection;
  const configs = import.meta.glob("/src/content/config.*", { eager: true });
  for (const cfg of Object.values(configs)) {
    const collections = (cfg as any)?.collections;
    if (
      collections &&
      Object.prototype.hasOwnProperty.call(collections, "calculators")
    ) {
      hasCalcCollection = true;
      break;
    }
  }
} catch {}

export const prerender = true;

const FALLBACK_SITE = "https://www.calcsimpler.com";

export async function GET({ site }: APIContext) {
  const origin = String(site ?? FALLBACK_SITE).replace(/\/$/, "");

  // 1) Rutas estáticas de alto valor
  const staticPaths = [
    "/",
    "/all",
    "/finance",
    "/personal-finance-loans",
    "/health",
    "/math",
    "/conversions",
    "/technology",
    "/date-time",
    "/home-diy",
    "/education",
    "/science",
    "/lifestyle-travel",
    "/web-marketing",
    "/privacy",
    "/disclaimer",
    "/categories",
  ];

  type UrlItem = {
    loc: string;
    changefreq?: string;
    priority?: number;
    lastmod?: string;
  };
  const urls: UrlItem[] = staticPaths.map((p) => ({
    loc: origin + p,
    changefreq: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : 0.6,
  }));

  // 2) Recolectar slugs de calculadoras (varios orígenes, con tolerancia de errores)
  let slugs: string[] = [];

  // 2a) Content Collections (si la colección existe)
  if (getCollectionFn && hasCalcCollection) {
    try {
      const entries = await getCollectionFn("calculators");
      if (Array.isArray(entries)) {
        for (const e of entries) {
          // e.slug a veces incluye "calculators/" al inicio
          const s: string = (e?.slug ?? "")
            .replace(/^calculators\//, "")
            .trim();
          if (s) slugs.push(s);
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 2b) MDX en /src/content/calculators/**
  try {
    const mdxA = import.meta.glob("/src/content/calculators/**/*.mdx", {
      eager: true,
    });
    for (const path of Object.keys(mdxA)) {
      const s = path.split("/calculators/")[1]?.replace(/\.mdx$/i, "");
      if (s) slugs.push(s);
    }
  } catch {
    /* ignore */
  }

  // 2c) MDX en /content/calculators/** (algunos repos usan esta raíz)
  try {
    const mdxB = import.meta.glob("/content/calculators/**/*.mdx", {
      eager: true,
    });
    for (const path of Object.keys(mdxB)) {
      const s = path.split("/calculators/")[1]?.replace(/\.mdx$/i, "");
      if (s) slugs.push(s);
    }
  } catch {
    /* ignore */
  }

  // 2d) Lista JSON opcional (si existe)
  try {
    // Desde src/pages hasta la raíz: ../../data/...
    const data = await import("../../data/calculators.json");
    const list = (data as any)?.default ?? data;
    if (Array.isArray(list)) {
      for (const item of list) {
        const base = (item?.slug ?? item?.id ?? item?.title ?? "")
          .toString()
          .trim()
          .toLowerCase();
        if (!base) continue;
        const s = base.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        if (s) slugs.push(s);
      }
    }
  } catch {
    /* ignore si no existe */
  }

  // 3) Deduplicación robusta
  slugs = Array.from(new Set(slugs.filter(Boolean)));

  // 4) Añadir URLs de calculadoras
  for (const s of slugs) {
    urls.push({
      loc: `${origin}/calculators/${s}`,
      changefreq: "monthly",
      priority: 0.8,
    });
  }

  // 5) Construcción del XML
  const now = new Date().toISOString();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const lastmod = u.lastmod ?? now;
        const cf = u.changefreq ?? "weekly";
        const pr = (u.priority ?? 0.7).toFixed(1);
        return (
          `  <url>\n` +
          `    <loc>${u.loc}</loc>\n` +
          `    <lastmod>${lastmod}</lastmod>\n` +
          `    <changefreq>${cf}</changefreq>\n` +
          `    <priority>${pr}</priority>\n` +
          `  </url>\n`
        );
      })
      .join("") +
    `</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
