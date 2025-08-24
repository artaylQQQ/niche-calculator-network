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

// Map various incoming cluster names to one of the top‑level categories used on the site.
// Keys should be lower‑cased to simplify lookups. See README for category definitions.
const CATEGORY_MAP = {
  'finance & loans': 'Finance',
  'percentages & ratios': 'Finance',
  'finance': 'Finance',
  'health & fitness': 'Health',
  'health': 'Health',
  'geometry & math': 'Math',
  'math': 'Math',
  'conversions & units': 'Conversions',
  'conversions': 'Conversions',
  'misc': 'Other',
  'other': 'Other',
  'everyday': 'Other',
  'technology': 'Technology',
  'date & time': 'Date & Time',
  'home & diy': 'Home & DIY',
  'education': 'Other'
};

// pick not yet published
const published = new Set(log.map(r => r.slug));
const backlog = all.filter(x => !published.has(x.slug));

function sanitizeExpr(expr) {
  // Preserve original exponent operator '^' used by our safe evaluator. If the input uses '**', convert it back.
  if (typeof expr !== 'string') return '';
  return expr.replace(/\*\*/g, '^');
}

function titleize(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function mdxFor(calc, related) {
  // Normalise the calculator's cluster to one of the supported categories. If no mapping is found
  // the original cluster is preserved or falls back to 'General'.
  const clusterRaw = (calc.cluster || '').toLowerCase();
  const clusterNorm = CATEGORY_MAP[clusterRaw] || calc.cluster || 'General';
  const front = `---
layout: ../../layouts/CalculatorLayout.astro
title: ${calc.title}
description: ${calc.intro}
date: ${TODAY}
updated: ${TODAY}
cluster: ${clusterNorm}
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
    cluster: clusterNorm,
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
` + related.map(r => `- [${titleize(r)}](/calculators/${r}/)`).join('\n') + '\n';

  return front + '\n' + importLine + '\n' + body;
}

function pickRelated(base) {
  const sameCluster = all.filter(c => c.slug !== base.slug && c.cluster === base.cluster);
  const pool = (sameCluster.length >= 6 ? sameCluster : all.filter(c => c.slug !== base.slug));
  return pool.slice(0,6).map(c => c.slug);
}

const n = Math.max(1, Math.min(100, Number(MAX) || 50));
const slice = backlog.slice(0, n);

for (const calc of slice) {
  const related = pickRelated(calc);
  const mdx = mdxFor(calc, related);
  const p = path.join(SRC, `${calc.slug}.mdx`);
  fs.writeFileSync(p, mdx, 'utf-8');
  log.push({ slug: calc.slug, date: TODAY });
}

fs.writeFileSync(LOGP, JSON.stringify(log, null, 2), 'utf-8');

console.log(`Published ${slice.length} calculators`);
