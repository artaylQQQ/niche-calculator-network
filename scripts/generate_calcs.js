// scripts/generate_calcs.js — V011 (safe, no self-link in related)
// Generates 20–100 MDX calculators per day into src/pages/calculators/
// Reads data/calculators.json and meta/publish_log.json (creates if missing).

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "calculators.json");
const OUT_DIR = path.join(ROOT, "src", "pages", "calculators");
const LOG = path.join(ROOT, "meta", "publish_log.json");

const MAX_RAW = Number(process.env.MAX_PER_DAY || "50");
const MAX = Math.max(1, Math.min(100, isNaN(MAX_RAW) ? 50 : MAX_RAW));

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
ensureDir(OUT_DIR); ensureDir(path.dirname(LOG));

function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf-8")); }
function writeJSON(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf-8"); }
function todayISO() { return new Date().toISOString().slice(0,10); }
function toSlug(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9\s\-]/g,"").replace(/\s+/g,"-").replace(/\-+/g,"-");
}
function norm(s){ return String(s||"").trim().toLowerCase(); }

function pickRelated(all, me, n = 6) {
  const meSlug = norm(me.slug);
  const sameCluster = all.filter(x => x.cluster === me.cluster && norm(x.slug) != meSlug);
  const pool = sameCluster.length ? sameCluster : all.filter(x => norm(x.slug) != meSlug);

  const seen = new Set();
  const out = [];
  for (const item of pool) {
    const s = norm(item.slug);
    if (s === meSlug || seen.has(s)) continue; // avoid self-link & duplicates
    seen.add(s);
    out.push(item.slug);
    if (out.length >= n) break;
  }
  return out;
}

function mdxLinkTitle(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function buildMDX(calc, related) {
  const date = todayISO();
  const description = calc.description || `${calc.title} — online calculator.`;
  const relatedList = related.filter(r => norm(r) !== norm(calc.slug));

  return `---
layout: ../../layouts/BaseLayout.astro
title: ${calc.title}
description: ${description}
date: ${date}
updated: ${date}
cluster: ${calc.cluster || "General"}
---

import Calculator from '../../components/Calculator.astro';

export const schema = ${JSON.stringify({
    slug: "",
    title: "",
    locale: "en",
    inputs: [],
    expression: "",
    formula_js: "",
    units: { input: "", output: "" },
    intro: "",
    examples: [],
    faqs: [],
    disclaimer: "Educational information, not professional advice.",
    schema_org: "FAQPage|SoftwareApplication",
    related: []
  }, null, 2)};

// Schema filled at runtime below for clarity:
export const schemaPatch = {
  slug: ${JSON.stringify(calc.slug)},
  title: ${JSON.stringify(calc.title)},
  locale: ${JSON.stringify(calc.locale || "en")},
  inputs: ${JSON.stringify(calc.inputs || [])},
  expression: ${JSON.stringify(calc.expression || "")},
  formula_js: "",
  units: ${JSON.stringify(calc.units || { input: "", output: "" })},
  intro: ${JSON.stringify(calc.intro || "")},
  examples: ${JSON.stringify(calc.examples || [])},
  faqs: ${JSON.stringify(calc.faqs || [])},
  disclaimer: ${JSON.stringify(calc.disclaimer || "Educational information, not professional advice.")},
  schema_org: ${JSON.stringify(calc.schema_org || "FAQPage|SoftwareApplication")},
  related: ${JSON.stringify(relatedList)}
};

export const schemaFinal = Object.assign({}, schema, schemaPatch);

# ${calc.title}

${calc.intro || ""}

<Calculator schema={schemaFinal} />

## FAQ
${(calc.faqs || []).map(f => `- **${f.q}** — ${f.a}`).join("\n")}

## Related calculators
${relatedList.length ? relatedList.map(r => `- [${mdxLinkTitle(r)}](/calculators/${r}/)`).join("\n") : "_No related calculators yet._"}
`;
}

function main() {
  if (!fs.existsSync(DATA)) {
    console.error("Missing data/calculators.json"); process.exit(1);
  }
  const all = readJSON(DATA).map(x => ({
    ...x,
    slug: toSlug(x.slug || x.title || ""),
    cluster: x.cluster || "General"
  })).filter(x => x.slug);

  if (!all.length) { console.log("No calculators in data/calculators.json"); return; }

  const published = fs.existsSync(LOG) ? readJSON(LOG) : { dates: {}, slugs: [] };
  const already = new Set(published.slugs || []);
  const candidates = all.filter(x => !already.has(x.slug));

  if (!candidates.length) { console.log("No pending calculators."); return; }

  const batch = candidates.slice(0, MAX);
  const written = [];

  for (const calc of batch) {
    const related = pickRelated(all, calc, 6);
    const mdx = buildMDX(calc, related);
    const file = path.join(OUT_DIR, `${calc.slug}.mdx`);
    require("fs").writeFileSync(file, mdx, "utf-8");
    written.push(calc.slug);
  }

  const today = todayISO();
  published.dates[today] = (published.dates[today] || []).concat(written);
  published.slugs = Array.from(new Set([...(published.slugs || []), ...written]));
  writeJSON(LOG, published);

  console.log(`Published ${written.length} calculators`);
}

main();
