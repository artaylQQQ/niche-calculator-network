// scripts/generate_calcs.js — V011
// Generate 20–100 MDX calculators per day into src/pages/calculators/
// Reads data/calculators.json and meta/publish_log.json (creates if missing).

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "calculators.json");
const OUT_DIR = path.join(ROOT, "src", "pages", "calculators");
const LOG = path.join(ROOT, "meta", "publish_log.json");

const MAX = Number(process.env.MAX_PER_DAY || "50");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(LOG))) fs.mkdirSync(path.dirname(LOG), { recursive: true });

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function toSlug(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-");
}

function pickRelated(all, me, n=6) {
  const sameCluster = all.filter(x => x.cluster === me.cluster && x.slug !== me.slug);
  const pool = (sameCluster.length ? sameCluster : all.filter(x => x.slug !== me.slug));
  const uniq = new Set();
  const out = [];
  for (const item of pool) {
    if (uniq.size >= n) break;
    if (!uniq.has(item.slug)) { uniq.add(item.slug); out.push(item.slug); }
  }
  return out.slice(0, n);
}

function buildMDX(calc, related) {
  const date = todayISO();
  const description = calc.description || `${calc.title} — online calculator.`;
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
    slug: calc.slug,
    title: calc.title,
    locale: calc.locale || "en",
    inputs: calc.inputs || [],
    expression: calc.expression || "",
    formula_js: "", // disabled for safety
    units: calc.units || { input: "", output: "" },
    intro: calc.intro || "",
    examples: calc.examples || [],
    faqs: calc.faqs || [],
    disclaimer: calc.disclaimer || "Educational information, not professional advice.",
    schema_org: calc.schema_org || "FAQPage|SoftwareApplication",
    related
  }, null, 2)};

# ${calc.title}

${calc.intro || ""}

<Calculator schema={schema} />

## FAQ
${(calc.faqs || []).map(f => `- **${f.q}** — ${f.a}`).join("\n")}

## Related calculators
${related.map(r => `- [${toSlug(r).replace(/-/g," ")}](/calculators/${r}/)`).join("\n")}
`;
}

function main() {
  if (!fs.existsSync(DATA)) {
    console.error("Missing data/calculators.json"); process.exit(1);
  }
  const all = readJSON(DATA);
  const published = fs.existsSync(LOG) ? readJSON(LOG) : { dates: {}, slugs: [] };

  const already = new Set(published.slugs || []);
  const candidates = all.filter(x => !already.has(x.slug));
  if (!candidates.length) { console.log("No pending calculators."); return; }

  const batch = candidates.slice(0, Math.max(1, Math.min(100, MAX)));
  const written = [];

  for (const calc of batch) {
    const slug = toSlug(calc.slug || calc.title);
    calc.slug = slug;
    const mdxPath = path.join(OUT_DIR, `${slug}.mdx`);
    const related = pickRelated(all, calc, 6).filter(s => s !== slug);
    const mdx = buildMDX(calc, related);
    fs.writeFileSync(mdxPath, mdx, "utf-8");
    written.push(slug);
  }

  const today = todayISO();
  published.dates[today] = (published.dates[today] || []).concat(written);
  published.slugs = Array.from(new Set([...(published.slugs || []), ...written]));
  writeJSON(LOG, published);

  console.log(`Published ${written.length} calculators`);
}

main();
