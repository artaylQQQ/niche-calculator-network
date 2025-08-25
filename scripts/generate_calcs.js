// scripts/generate_calcs.js — V036
// Reads data/source_calculators.json (or data/calculators.json legacy) and
// generates MDX files under src/pages/calculators/, plus writes JSON-LD under public/schema/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA1 = path.join(ROOT, 'data', 'source_calculators.json');
const DATA_LEGACY = path.join(ROOT, 'data', 'calculators.json');
const OUT_MDX = path.join(ROOT, 'src', 'pages', 'calculators');
const OUT_SCHEMA = path.join(ROOT, 'public', 'schema');
const LOGP = path.join(ROOT, 'meta', 'publish_log.json');

const MAX = Math.max(20, Math.min(100, Number(process.env.MAX_PER_DAY || 40)));
const today = new Date().toISOString().slice(0,10);

function readJSON(p, fallback){
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch{ return fallback; }
}

const source = readJSON(DATA1, null) || readJSON(DATA_LEGACY, []);
if (!source || !Array.isArray(source)) {
  console.warn('No source calculators found in data/');
  process.exit(0);
}

let log = readJSON(LOGP, []);
const publishedSlugs = new Set(log.map(x => x.slug));

const pending = source.filter(it => !publishedSlugs.has(it.slug));
if (!pending.length) {
  console.log('No pending calculators.');
  process.exit(0);
}

fs.mkdirSync(OUT_MDX, { recursive: true });
fs.mkdirSync(OUT_SCHEMA, { recursive: true });

let count = 0;
for (const it of pending) {
  if (count >= MAX) break;
  // Basic required fields
  if (!it.slug || !it.title || !it.expression || !Array.isArray(it.inputs)) continue;

  // Enrich content in English
  const description = it.description || `Online ${it.title} — fast, accurate and easy to use.`;
  const intro = it.intro || `Use this ${it.title.toLowerCase()} to get quick, reliable results. Enter your values and click Calculate.`;
  const examples = it.examples?.length ? it.examples : [
    `Try with sample values to see how the ${it.title.toLowerCase()} works.`
  ];
  const faqs = it.faqs?.length ? it.faqs : [
    { question: `What is the ${it.title}?`, answer: `It's a simple tool that computes ${it.title.toLowerCase()} instantly.` },
    { question: 'Is this calculator free?', answer: 'Yes, it is free and requires no sign up.' }
  ];
  const metaDescription = it.metaDescription || description;

  const schema = {
    slug: it.slug,
    title: it.title,
    description,
    intro,
    expression: it.expression,
    unit: it.unit || '',
    category: it.category || it.cluster || 'Other',
    cluster: it.cluster || it.category || 'Other',
    inputs: it.inputs,
    examples,
    faqs,
    metaDescription,
    updated: today
  };

  // Write MDX
  const mdx = `---
layout: ../../layouts/CalculatorLayout.astro
title: "${schema.title}"
description: "${metaDescription}"
updated: "${today}"
cluster: "${schema.cluster}"
---

import Calculator from '../../components/Calculator.astro';
export const schema = ${JSON.stringify(schema, null, 2)};

<Calculator schema={schema} />
`;
  fs.writeFileSync(path.join(OUT_MDX, `${schema.slug}.mdx`), mdx, 'utf-8');

  // Write JSON-LD (FAQ & Calculator metadata) to public/schema/{slug}.json
  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": schema.title,
      "applicationCategory": "Calculator",
      "description": metaDescription
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": { "@type": "Answer", "text": q.answer }
      }))
    }
  ];
  fs.writeFileSync(path.join(OUT_SCHEMA, `${schema.slug}.json`), JSON.stringify(jsonld, null, 2), 'utf-8');

  log.push({ slug: schema.slug, date: today });
  count++;
}

fs.mkdirSync(path.dirname(LOGP), { recursive: true });
fs.writeFileSync(LOGP, JSON.stringify(log, null, 2));

console.log(`Generated ${count} calculators on ${today}`);
