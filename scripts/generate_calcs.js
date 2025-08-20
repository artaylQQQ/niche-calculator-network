// generate_calcs.js — V026-fix
// Reads data/calculators.json and creates MDX files in src/pages/calculators/
// Adds 6 related links by cluster and logs published slugs to meta/publish_log.json

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src', 'pages', 'calculators');
const DATA = path.join(ROOT, 'data', 'calculators.json');
const LOGP = path.join(ROOT, 'meta', 'publish_log.json');

const MAX = Math.min(100, Math.max(1, Number(process.env.MAX_PER_DAY || 50)));
const TODAY = new Date().toISOString().slice(0,10);

fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(path.dirname(LOGP), { recursive: true });

const all = JSON.parse(fs.readFileSync(DATA, 'utf8'));
if (!Array.isArray(all)) { console.error('data/calculators.json must be an array'); process.exit(1); }

// slug uniqueness
const seen = new Set();
for (const row of all) {
  if (!row.slug) { console.error('Missing slug in calculators.json'); process.exit(1); }
  if (seen.has(row.slug)) { console.error('Duplicate slug: ' + row.slug); process.exit(1); }
  seen.add(row.slug);
}

let log = [];
try { log = JSON.parse(fs.readFileSync(LOGP, 'utf8')); } catch(_) { log = []; }
const published = new Set(log.map(r => r.slug));

// backlog
const backlog = all.filter(x => !published.has(x.slug));
if (backlog.length === 0) { console.log('Nothing to publish'); process.exit(0); }

// pick up to MAX
const toPub = backlog.slice(0, MAX);

// map by cluster
const byCluster = new Map();
for (const c of all) {
  const key = c.cluster || 'general';
  if (!byCluster.has(key)) byCluster.set(key, []);
  byCluster.get(key).push(c);
}

function mdxFor(calc, related) {
  const json = {
    slug: calc.slug,
    title: calc.title,
    locale: calc.locale || 'en',
    inputs: calc.inputs || [],
    expression: calc.expression || '',
    intro: calc.intro || '',
    examples: calc.examples || [],
    faqs: calc.faqs || [],
    disclaimer: calc.disclaimer || 'Educational information, not professional advice.',
    schema_org: calc.schema_org || 'FAQPage'
  };
  const front = `---
cluster: "${(calc.cluster || 'General').replace(/"/g,'\\"')}"
title: "${(calc.title || 'Calculator').replace(/"/g,'\\"')}"
description: "${(calc.description || calc.intro || '').replace(/"/g,'\\"')}"
updated: "${TODAY}"
---

import BaseLayout from "../../layouts/BaseLayout.astro";
import Calculator from "../../components/Calculator.astro";

export const schema = ${JSON.stringify(json, null, 2)};
`;
  const relList = related.slice(0,6).map(r => `      <li><a href="/calculators/${r.slug}/">${r.title}</a></li>`).join('\n');
  return `${front}
<BaseLayout title={schema.title} description={schema.description}>
  <Calculator schema={schema} />

  <section class="mt-8">
    <h2>Related calculators</h2>
    <ul>
${relList}
    </ul>
  </section>
</BaseLayout>
`;
}

let count = 0;
for (const calc of toPub) {
  const relPool = (byCluster.get(calc.cluster || 'general') || []).filter(x => x.slug !== calc.slug);
  const related = relPool.slice(0, 6);
  const mdx = mdxFor(calc, related);
  const out = path.join(SRC, `${calc.slug}.mdx`);
  fs.writeFileSync(out, mdx, 'utf8');
  log.push({ slug: calc.slug, date: TODAY });
  count++;
}

fs.writeFileSync(LOGP, JSON.stringify(log, null, 2) + '\n', 'utf8');
console.log(`Published ${count} calculators`);
