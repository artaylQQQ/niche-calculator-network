import fs from 'node:fs';
import path from 'node:path';

/**
 * Daily calculator generator
 *
 * This script reads definitions from `data/calculators.json` and emits one
 * Astro MDX file per calculator into `src/pages/calculators/`.  A log file in
 * `meta/publish_log.json` records which calculators have already been
 * published so they are not generated again.  The number of calculators
 * generated on each run can be limited via the `MAX_PER_DAY` environment
 * variable (defaults to 50).  Each generated page uses the
 * `CalculatorLayout.astro` layout which adds structured data to the page.
 */

const ROOT = process.cwd();
const CALC_DATA = path.join(ROOT, 'data', 'calculators.json');
const OUT_DIR   = path.join(ROOT, 'src', 'pages', 'calculators');
const LOG_PATH  = path.join(ROOT, 'meta', 'publish_log.json');

// Normalise arbitrary cluster names to one of the eight supported top‑level
// categories.  All keys must be lower‑case.
const CATEGORY_MAP: Record<string, string> = {
  // finance
  'finance & loans':       'Finance',
  'percentages & ratios':  'Finance',
  'finance':               'Finance',
  'business':              'Finance',
  'business & commerce':   'Finance',
  'taxes':                 'Finance',
  // health
  'health & fitness':      'Health',
  'health':                'Health',
  'bmi':                   'Health',
  // conversions
  'conversions & units':   'Conversions',
  'unit conversions':      'Conversions',
  'unit and currency conversions': 'Conversions',
  'conversions':           'Conversions',
  // math
  'math':                  'Math',
  'geometry':              'Math',
  'geometry & math':       'Math',
  'areas & volumes':       'Math',
  'algebra':               'Math',
  'statistics':            'Math',
  'averages and probabilities': 'Math',
  // technology
  'technology':            'Technology',
  'tech':                  'Technology',
  'computing':             'Technology',
  'technology & computing':'Technology',
  // date & time
  'date & time':           'Date & Time',
  'time & date':           'Date & Time',
  'time-date':             'Date & Time',
  'durations and schedules': 'Date & Time',
  // home & diy
  'home & diy':            'Home & DIY',
  'home and diy':          'Home & DIY',
  'diy':                   'Home & DIY',
  'household':             'Home & DIY',
  // other/misc
  'misc':                  'Other',
  'miscellaneous':         'Other',
  'other':                 'Other',
  'everyday':              'Other',
  'general':               'Other',
  'education':             'Other',
  'science':               'Other'
};

// Read helpers
function readJSON<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch (err) {
    return fallback;
  }
}

function writeJSON(p: string, data: any): void {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

// Sanitize the expression string.  Our safe evaluator uses `^` as the
// exponent operator; if incoming expressions use `**` we convert them.
function sanitizeExpr(expr: unknown): string {
  if (typeof expr !== 'string') return '';
  return expr.replace(/\*\*/g, '^');
}

// Pick up to `count` related calculators from the same cluster if available
// otherwise from the full list.  Related calculators are chosen based on
// their order in the data file and exclude the base calculator.
function pickRelated(base: any, all: any[], count = 6): string[] {
  const same = all.filter((c) => c.slug !== base.slug && c.cluster === base.cluster);
  const pool = same.length >= count ? same : all.filter((c) => c.slug !== base.slug);
  return pool.slice(0, count).map((c) => c.slug);
}

function titleize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Main entry point
(() => {
  const items: any[] = readJSON(CALC_DATA, []);
  const log: { slug: string; date: string }[] = readJSON(LOG_PATH, []);
  const published = new Set(log.map((r) => r.slug));
  const backlog = items.filter((c) => !published.has(c.slug));
  if (!backlog.length) {
    console.log('No new calculators to generate');
    return;
  }
  const maxPerDay = Math.max(1, Math.min(100, parseInt(process.env.MAX_PER_DAY || process.env.MAX_PER_DAY_GITHUB || '50', 10)));
  const today = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const toPublish = backlog.slice(0, maxPerDay);

  for (const calc of toPublish) {
    // Normalise cluster
    const rawCluster = (calc.cluster || '').toString().toLowerCase();
    const normCluster = CATEGORY_MAP[rawCluster] || calc.cluster || 'Other';
    // Prepare schema for frontmatter and runtime
    const related = pickRelated(calc, items);
    const schema = {
      slug: calc.slug,
      title: calc.title,
      locale: 'en',
      inputs: calc.inputs || [],
      expression: sanitizeExpr(calc.expression || ''),
      intro: calc.intro || calc.description || '',
      examples: Array.isArray(calc.examples) && calc.examples.length ? calc.examples : [
        { description: 'Enter the values and press Calculate.' }
      ],
      faqs: Array.isArray(calc.faqs) ? calc.faqs : [],
      disclaimer: calc.disclaimer || 'Educational information, not professional advice.',
      cluster: normCluster,
      related,
      schema_org: 'FAQPage|SoftwareApplication'
    };
    // Build frontmatter
    const frontmatter = [];
    frontmatter.push('---');
    frontmatter.push(`layout: ../../layouts/CalculatorLayout.astro`);
    frontmatter.push(`title: ${JSON.stringify(calc.title)}`);
    frontmatter.push(`description: ${JSON.stringify(schema.intro)}`);
    frontmatter.push(`date: ${today}`);
    frontmatter.push(`updated: ${today}`);
    frontmatter.push(`cluster: ${JSON.stringify(normCluster)}`);
    frontmatter.push('---\n');
    // Compose MDX body
    let body = '';
    body += "import Calculator from '../../components/Calculator.astro';\n\n";
    body += `export const schema = ${JSON.stringify(schema, null, 2)}\n\n`;
    body += `# ${calc.title}\n\n`;
    body += `${schema.intro}\n\n`;
    body += '<Calculator schema={schema} />\n\n';
    // FAQ section
    if (schema.faqs.length) {
      body += '## FAQ\n\n';
      schema.faqs.forEach((f: any) => {
        body += `### ${f.question}\n\n${f.answer}\n\n`;
      });
    }
    // Related section
    if (related.length) {
      body += '## Related calculators\n\n';
      related.forEach((slug: string) => {
        body += `- [${titleize(slug)}](/calculators/${slug}/)\n`;
      });
      body += '\n';
    }
    const mdxContent = frontmatter.join('\n') + body;
    const outPath = path.join(OUT_DIR, `${calc.slug}.mdx`);
    fs.writeFileSync(outPath, mdxContent, 'utf-8');
    // Append to log
    log.push({ slug: calc.slug, date: today });
  }
  writeJSON(LOG_PATH, log);
  console.log(`Published ${toPublish.length} calculators`);
})();