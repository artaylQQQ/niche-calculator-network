// scripts/generate_calcs_v2.js — minimal validated generator (stub)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'calculators.json');
const outDir = path.join(root, 'src', 'pages', 'calculators');
const logPath = path.join(root, 'meta', 'publish_log.json');
const maxPerDay = parseInt(process.env.MAX_PER_DAY || '50', 10);

const raw = fs.readFileSync(dataPath, 'utf8');
const items = JSON.parse(raw);

function valid(item){
  const req = ['slug','title','inputs','expression'];
  return req.every(k => item && k in item);
}
fs.mkdirSync(outDir, { recursive: true });

let published = 0;
const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
const publishedSlugs = new Set(log.map(e => e.slug));

for(const item of items){
  if(published >= maxPerDay) break;
  if(!valid(item) || publishedSlugs.has(item.slug)) continue;
  const mdx = `---
layout: ../../layouts/BaseLayout.astro
title: ${JSON.stringify(item.title)}
description: ${JSON.stringify(item.intro || item.title)}
---
import Calculator from '../../components/Calculator.astro';

# ${item.title}

${item.intro || ''}

<Calculator schema={${JSON.stringify(item)}} />

`;
  fs.writeFileSync(path.join(outDir, `${item.slug}.mdx`), mdx);
  log.push({ slug: item.slug, date: new Date().toISOString().slice(0,10) });
  published++;
}
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log('Generated', published, 'calculators');
