
/**
 * scripts/generate_calcs.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const META_DIR = path.join(ROOT, 'meta');
const SEEDS_FILE = path.join(META_DIR, 'seeds', 'calculators.json');
const STATE_FILE = path.join(META_DIR, 'publish_state.json');
const OUT_DIR = path.join(ROOT, 'content', 'calculators');

const PER_RUN = Number(process.env.PUBLISH_PER_RUN || 30); // 20–100 suggested
fs.mkdirSync(path.dirname(SEEDS_FILE), { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function loadSeeds(){
  if (fs.existsSync(SEEDS_FILE)) {
    return JSON.parse(fs.readFileSync(SEEDS_FILE, 'utf-8'));
  }
  return [];
}

function loadState(){
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE,'utf-8'));
  return { published: [] };
}

function saveState(state){
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function renderMDX(item){
  const fm = {
    title: item.title,
    description: item.description,
    schema: item.schema,
    faqs: item.faqs || []
  };
  const body = `---
${JSON.stringify(fm, null, 2).replace(/^{/,'').replace(/}$/,'')}
---

{/* Auto-generated. */}
`;
  return body;
}

const seeds = loadSeeds();
const state = loadState();
const already = new Set(state.published || []);
const queue = seeds.filter(s => !already.has(s.slug));
const publishCount = Math.max(1, Math.min(PER_RUN, 100));
const todayBatch = queue.slice(0, publishCount);

for (const item of todayBatch) {
  const mdx = renderMDX(item);
  fs.writeFileSync(path.join(OUT_DIR, `${item.slug}.mdx`), mdx);
  already.add(item.slug);
  console.log('Published:', item.slug);
}

state.published = Array.from(already);
saveState(state);

// Update site-data list for All/Categories
const SITE_DATA = path.join(ROOT, 'src', 'site-data', 'calculators.json');
let list = [];
if (fs.existsSync(SITE_DATA)) list = JSON.parse(fs.readFileSync(SITE_DATA,'utf-8'));
for (const item of todayBatch) {
  if (!list.find(x => x.slug === item.slug)) {
    list.push({
      slug: item.slug,
      title: item.title,
      description: item.description,
      category: item.category,
      category_title: item.category_title,
      schema: item.schema,
      faqs: item.faqs || []
    });
  }
}
fs.writeFileSync(SITE_DATA, JSON.stringify(list, null, 2));
console.log('Updated site-data with', todayBatch.length, 'items');
