// Safe generator: reads data/calculators.json and creates MDX files in src/pages/calculators/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src', 'pages', 'calculators');
const DATA = path.join(ROOT, 'data', 'calculators.json');
const LOGP = path.join(ROOT, 'meta', 'publish_log.json');

const MAX = Number(process.env.MAX_PER_DAY || process.env.MAX_PER_DAY_GITHUB || 50);
const TODAY = new Date().toISOString().slice(0,10);

// Ensure dirs
fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(path.dirname(LOGP), { recursive: true });

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return fallback; }
}

const all = readJSON(DATA, []);
const log = readJSON(LOGP, []);

// pick not yet published
const published = new Set(log.map(r => r.slug));
const backlog = all.filter(x => !published.has(x.slug));

function sanitizeExpr(expr) {
  if (typeof expr !== 'string') return '';
  return expr.replace(/\^/g, '**');
}

function mdxFor(calc, related) {
  const front = `---
layout: ../../layouts/BaseLayout.astro
title: ${calc.title}
description: ${calc.intro}
date: ${TODAY}
updated: ${TODAY}
cluster: ${calc.cluster || 'General'}
---
`;

  const importLine = "import Calculator from '../../components/Calculator.astro';\n";
  const schema = {
    slug: calc.slug,
    title: calc.title,
    locale: 'en',
    inputs: calc.inputs || [],
    expression: sanitizeExpr(calc.expression || ''),
    formula_js: '',
    units: calc.units || {"input":"","output":""},
    intro: calc.intro || '',
    examples: calc.examples || [],
    faqs: calc.faqs || [],
    disclaimer: calc.disclaimer || 'Educational information, not professional advice.',
    schema_org: calc.schema_org || 'FAQPage|SoftwareApplication',
    cluster: calc.cluster || 'General',
    related
  };
  const schemaJSON = JSON.stringify(schema, null, 2);
  const body = `
export const schema = ${schemaJSON}

# ${calc.title}

${calc.intro || ''}

<Calculator schema={schema} />

## FAQ

- _No FAQs yet._

## Related calculators
` + related.map(r => `- [${r.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}](/calculators/${r}/)`).join('\n') + '\n';

  return front + '\n' + importLine + '\n' + body;
}

function pickRelated(base, allSlugs) {
  const pool = all.filter(c => c.slug !== base.slug && c.cluster === base.cluster);
  const list = (pool.length >= 6 ? pool : all.filter(c => c.slug !== base.slug)).slice(0,6);
  return list.map(c => c.slug);
}

const n = Math.max(1, Math.min(100, Number(MAX) || 50));
const slice = backlog.slice(0, n);

for (const calc of slice) {
  const related = pickRelated(calc, all.map(c => c.slug));
  const mdx = mdxFor(calc, related);
  const p = path.join(SRC, `${calc.slug}.mdx`);
  fs.writeFileSync(p, mdx, 'utf-8');
  log.push({ slug: calc.slug, date: TODAY });
}

fs.writeFileSync(LOGP, JSON.stringify(log, null, 2), 'utf-8');

console.log(`Published ${slice.length} calculators`);
