// scripts/generate_calcs.js — V015 (listas HTML para FAQ/related; evita parse MDX)
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

function esc(s){
  return String(s||"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/{/g,"&#123;").replace(/}/g,"&#125;");
}

function toSlug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9\s\-]/g,"")
    .replace(/\s+/g,"-")
    .replace(/\-+/g,"-")
    .replace(/^\-+|\-+$/g,"");
}

function norm(s){ return String(s||"").trim().toLowerCase(); }
function safeTitle(s) { const t = String(s || "").trim(); return t.length ? t : "Calculator"; }

const SAFE_EXPR_RE = /^[0-9+\-*/%^().\sEe]+$/;

function validateExpression(expr, inputNames) {
  if (!expr) return true;
  let s = String(expr);
  const names = Array.from(new Set((inputNames || []).map(n => String(n || "")))).sort((a,b)=>b.length-a.length);
  for (const k of names) {
    if (!k) continue;
    const re = new RegExp(`\\b${k}\\b`, "g");
    s = s.replace(re, "1");
  }
  if (!SAFE_EXPR_RE.test(s)) return false;
  if (/([A-Za-z_][A-Za-z0-9_]*|{|}|\[|\]|new|function|=>|;)/.test(s)) return false;
  return true;
}

function pickRelated(all, me, n = 6) {
  const meSlug = norm(me.slug);
  const sameCluster = all.filter(x => x.cluster === me.cluster && norm(x.slug) !== meSlug);
  const pool = sameCluster.length ? sameCluster : all.filter(x => norm(x.slug) !== meSlug);
  const seen = new Set();
  const out = [];
  for (const item of pool) {
    const s = norm(item.slug);
    if (s === meSlug || seen.has(s)) continue;
    seen.add(s);
    out.push(item.slug);
    if (out.length >= n) break;
  }
  return out;
}

function mdxLinkTitle(slug) {
  return String(slug || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function buildFAQ(faqs){
  if (!Array.isArray(faqs) || !faqs.length) return "<p><em>No FAQs yet.</em></p>";
  const items = faqs.map(f => `<li><strong>${esc(f.q)}</strong> — ${esc(f.a)}</li>`).join("\n");
  return `<ul>\n${items}\n</ul>`;
}

function buildRelated(related){
  if (!Array.isArray(related) || !related.length) return "<p><em>No related calculators yet.</em></p>";
  const items = related.map(slug => `<li><a href="/calculators/${slug}/">${mdxLinkTitle(slug)}</a></li>`).join("\n");
  return `<ul>\n${items}\n</ul>`;
}

function buildMDX(calc, related) {
  const date = todayISO();
  const description = calc.description || `${calc.title} — online calculator.`;
  const relatedList = related.filter(r => norm(r) !== norm(calc.slug));

  const faqHTML = buildFAQ(calc.faqs || []);
  const relHTML = buildRelated(relatedList);

  return `---
layout: ../../layouts/BaseLayout.astro
title: ${safeTitle(calc.title)}
description: ${esc(description)}
date: ${date}
updated: ${date}
cluster: ${calc.cluster || "General"}
---

import Calculator from '../../components/Calculator.astro';

export const schema = {
  "slug": ${JSON.stringify(calc.slug)},
  "title": ${JSON.stringify(safeTitle(calc.title))},
  "locale": ${JSON.stringify(calc.locale || "en")},
  "inputs": ${JSON.stringify(calc.inputs || [])},
  "expression": ${JSON.stringify(calc.expression || "")},
  "formula_js": "",
  "units": ${JSON.stringify(calc.units || { input: "", output: "" })},
  "intro": ${JSON.stringify(calc.intro || "")},
  "examples": ${JSON.stringify(calc.examples || [])},
  "faqs": ${JSON.stringify(calc.faqs || [])},
  "disclaimer": ${JSON.stringify(calc.disclaimer || "Educational information, not professional advice.")},
  "schema_org": ${JSON.stringify(calc.schema_org || "FAQPage|SoftwareApplication")},
  "related": ${JSON.stringify(relatedList)}
}

# ${safeTitle(calc.title)}

${esc(calc.intro || "")}

<Calculator schema={schema} />

## FAQ
${faqHTML}

## Related calculators
${relHTML}
`;
}

function main() {
  if (!fs.existsSync(DATA)) {
    console.error("Missing data/calculators.json"); process.exit(1);
  }
  const all0 = readJSON(DATA);
  if (!Array.isArray(all0)) { console.error("calculators.json must be an array"); process.exit(1); }

  const all = [];
  const seen = new Set();
  for (const raw of all0) {
    const title = safeTitle(raw.title);
    const slug = toSlug(raw.slug || title);
    if (!slug) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const inputs = Array.isArray(raw.inputs) ? raw.inputs : [];
    const expr = typeof raw.expression === "string" ? raw.expression.trim() : "";

    if (!validateExpression(expr, inputs.map(i => i.name))) {
      raw.expression = "";
    }

    all.push({
      ...raw,
      title,
      slug,
      cluster: raw.cluster || "General"
    });
  }

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
    fs.writeFileSync(file, mdx, "utf-8");
    written.push(calc.slug);
  }

  const today = todayISO();
  published.dates[today] = (published.dates[today] || []).concat(written);
  published.slugs = Array.from(new Set([...(published.slugs || []), ...written]));
  writeJSON(LOG, published);

  console.log(`Published ${written.length} calculators`);
}

main();
