// Minimal generator with validation & daily cap
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'calculators.json');
const outDir = path.join(root, 'src', 'pages', 'calculators');
const logPath = path.join(root, 'meta', 'publish_log.json');
const maxPerDay = parseInt(process.env.MAX_PER_DAY || '50', 10);

const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
const publishedSlugs = new Set(log.map(e => e.slug));
let published = 0;

for (const it of items) {
  if (published >= maxPerDay) break;
  if (!it || !it.slug || !it.title || !it.expression || !Array.isArray(it.inputs)) continue;
  if (publishedSlugs.has(it.slug)) continue;
  const mdx = `---
layout: ../../layouts/CalculatorLayout.astro
title: ${JSON.stringify(it.title)}
description: ${JSON.stringify(it.intro || it.title)}
cluster: ${JSON.stringify(it.cluster || '')}
---
import Calculator from '../../components/Calculator.astro';

# ${it.title}

${it.intro || ''}

<Calculator schema={${JSON.stringify(it)}} />
`;
  fs.writeFileSync(path.join(outDir, `${it.slug}.mdx`), mdx);
  log.push({ slug: it.slug, date: new Date().toISOString().slice(0,10) });
  published++;
}

fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log('Generated', published, 'calculators');
