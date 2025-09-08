// src/pages/sitemap.xml.ts
// Sitemap sólido para Astro, con tolerancia a distintas fuentes de datos.
// - Cubre rutas estáticas (home, categorías, listados).
// - Cubre calculadoras desde Content Collections (getCollection('calculators')).
// - Fallbacks: escaneo de MDX en /src/content/calculators y /content/calculators,
//   y opcionalmente lectura de data/calculators.json si existe.
// - Deduplica slugs y nunca lanza el build por fallos de import: todo va envuelto en try/catch.

import type { APIContext } from "astro";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
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

async function fileLastmod(p: string): Promise<string | undefined> {
  try {
    const { mtime } = await stat(resolve(p));
    return mtime.toISOString();
  } catch {
    return undefined;
  }
}

export async function GET({ site }: APIContext) {
  const origin = String(site ?? FALLBACK_SITE).replace(/\/$/, "");

  // 1) Rutas estáticas de alto valor con sus archivos fuente
  const staticPaths = [
    { route: "/", file: "src/pages/index.astro" },
    { route: "/all", file: "src/pages/all.astro" },
    { route: "/finance", file: "src/pages/finance.astro" },
    {
      route: "/personal-finance-loans",
      file: "src/pages/personal-finance-loans.astro",
    },
    { route: "/health", file: "src/pages/health.astro" },
    { route: "/math", file: "src/pages/math.astro" },
    { route: "/conversions", file: "src/pages/conversions.astro" },
    { route: "/technology", file: "src/pages/technology.astro" },
    { route: "/date-time", file: "src/pages/date-time.astro" },
    { route: "/home-diy", file: "src/pages/home-diy.astro" },
    { route: "/education", file: "src/pages/education.astro" },
    { route: "/science", file: "src/pages/science.astro" },
    { route: "/lifestyle-travel", file: "src/pages/lifestyle-travel.astro" },
    { route: "/web-marketing", file: "src/pages/web-marketing.astro" },
    { route: "/privacy", file: "src/pages/privacy.astro" },
    { route: "/disclaimer", file: "src/pages/disclaimer.astro" },
    { route: "/categories", file: "src/pages/categories/index.astro" },
  ];

  type UrlItem = {
    loc: string;
    changefreq?: string;
    priority?: number;
    lastmod?: string;
  };
  const urls: UrlItem[] = [];
  for (const p of staticPaths) {
    const lastmod = await fileLastmod(p.file);
    urls.push({
      loc: origin + p.route,
      changefreq: p.route === "/" ? "daily" : "weekly",
      priority: p.route === "/" ? 1.0 : 0.6,
      ...(lastmod ? { lastmod } : {}),
    });
  }

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

  // 4) Añadir URLs de calculadoras con su fecha de modificación real
  for (const s of slugs) {
    const candidates = [
      `src/pages/calculators/${s}.astro`,
      `src/content/calculators/${s}.mdx`,
      `content/calculators/${s}.mdx`,
    ];
    let lastmod: string | undefined;
    for (const c of candidates) {
      lastmod = await fileLastmod(c);
      if (lastmod) break;
    }
    urls.push({
      loc: `${origin}/calculators/${s}`,
      changefreq: "monthly",
      priority: 0.8,
      ...(lastmod ? { lastmod } : {}),
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
