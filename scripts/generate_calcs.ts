import fs from "node:fs";
import path from "node:path";

/**
 * Advanced calculator generator
 *
 * This script reads calculator definitions from `data/calculators.json` and
 * produces one MDX file per calculator under `src/pages/calculators/`.  A
 * log file at `meta/publish_log.json` records which calculators have
 * already been published so they are not generated again.  On each run
 * the number of new calculators can be controlled via the
 * `MAX_PER_DAY` environment variable.  Values outside the range 20–100
 * are clamped to the nearest bound to prevent creating too few or too
* many pages in a single batch.  Each generated MDX page uses the
* CalculatorLayout, exports a detailed schema for runtime use and relies on
* the Calculator component to render examples, related calculators and FAQs
* to avoid duplicate sections.
*/

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "calculators.json");
const OUT_DIR = path.join(ROOT, "src", "pages", "calculators");
const LOG_PATH = path.join(ROOT, "meta", "publish_log.json");

// Normalise arbitrary cluster names to one of the eight supported top‑level
// categories.  This ensures that calculators appear under the correct
// category page regardless of the input data.  Keys must be lower‑case.
const CATEGORY_MAP: Record<string, string> = {
  // finance
  "finance & loans": "Finance",
  "percentages & ratios": "Finance",
  finance: "Finance",
  business: "Finance",
  "business & commerce": "Finance",
  taxes: "Finance",
  // health
  "health & fitness": "Health",
  health: "Health",
  bmi: "Health",
  // conversions
  "conversions & units": "Conversions",
  "unit conversions": "Conversions",
  "unit and currency conversions": "Conversions",
  conversions: "Conversions",
  // math
  math: "Math",
  geometry: "Math",
  "geometry & math": "Math",
  "areas & volumes": "Math",
  algebra: "Math",
  statistics: "Math",
  "averages and probabilities": "Math",
  // technology
  technology: "Technology",
  tech: "Technology",
  computing: "Technology",
  "technology & computing": "Technology",
  // date & time
  "date & time": "Date & Time",
  "time & date": "Date & Time",
  "time-date": "Date & Time",
  "durations and schedules": "Date & Time",
  // home & diy
  "home & diy": "Home & DIY",
  "home and diy": "Home & DIY",
  diy: "Home & DIY",
  household: "Home & DIY",
  // everyday & misc
  misc: "Everyday & Misc",
  miscellaneous: "Everyday & Misc",
  other: "Everyday & Misc",
  everyday: "Everyday & Misc",
  general: "Everyday & Misc",
  education: "Everyday & Misc",
  science: "Everyday & Misc",
};

// Safely parse a JSON file, returning a fallback value on error.  This
// avoids throwing and makes the script tolerant of empty or missing files.
function readJSON<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch (_err) {
    return fallback;
  }
}

function writeJSON(p: string, data: unknown): void {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

// Replace instances of the JavaScript exponent operator with the caret
// operator expected by the safe evaluator used in the Calculator component.
function sanitizeExpr(expr: string): string {
  return typeof expr === "string" ? expr.replace(/\*\*/g, "^") : "";
}

// Select up to `count` related calculators from the same cluster (where
// possible).  Related calculators are chosen based on their order in the
// input data and exclude the base calculator itself.
function pickRelated(base: any, all: any[], count = 6): string[] {
  const same = all.filter(
    (c) => c.slug !== base.slug && c.cluster === base.cluster,
  );
  const pool =
    same.length >= count ? same : all.filter((c) => c.slug !== base.slug);
  return pool.slice(0, count).map((c) => c.slug);
}

// Main execution wrapped in an async function to allow top level await in
// future enhancements (e.g. fetching remote data).  Immediately invoked.
(function run(): void {
  // Load all calculator definitions and the publish log.
  const items: any[] = readJSON(DATA_PATH, []);
  const log: { slug: string; date: string }[] = readJSON(LOG_PATH, []);
  const published = new Set(log.map((r) => r.slug));
  const backlog = items.filter((c) => !published.has(c.slug));
  if (!backlog.length) {
    console.log("No new calculators to generate");
    return;
  }
  // Determine the number of calculators to generate based on MAX_PER_DAY.
  const rawMax = parseInt(
    process.env.MAX_PER_DAY || process.env.MAX_PER_DAY_GITHUB || "50",
    10,
  );
  const limit = Math.max(20, Math.min(100, isNaN(rawMax) ? 50 : rawMax));
  const today = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const toPublish = backlog.slice(0, limit);

  for (const calc of toPublish) {
    // Normalise the cluster using CATEGORY_MAP.  Fall back to the original
    // cluster or 'Everyday & Misc' if nothing matches.
    const rawCluster = (calc.cluster || "").toString().toLowerCase();
    const normCluster =
      CATEGORY_MAP[rawCluster] || calc.cluster || "Everyday & Misc";
    // Determine related calculators ahead of time.
    const related = pickRelated(calc, items);
    // Build a runtime schema used by the Calculator component.  Provide
    // sensible defaults for optional fields.
    const schema = {
      slug: calc.slug,
      title: calc.title,
      locale: "en",
      inputs: Array.isArray(calc.inputs) ? calc.inputs : [],
      expression: sanitizeExpr(calc.expression || ""),
      intro: calc.intro || calc.description || "",
      examples:
        Array.isArray(calc.examples) && calc.examples.length
          ? calc.examples
          : [{ description: "Enter the values and press Calculate." }],
      faqs: Array.isArray(calc.faqs) ? calc.faqs : [],
      disclaimer:
        calc.disclaimer || "Educational information, not professional advice.",
      cluster: normCluster,
      related,
    };
    // Compose frontmatter for the MDX file.  Use CalculatorLayout and
    // include both date and updated fields for SEO freshness signals.
    const frontmatter: string[] = [];
    frontmatter.push("---");
    frontmatter.push(`layout: ../../layouts/CalculatorLayout.astro`);
    frontmatter.push(`title: ${JSON.stringify(calc.title)}`);
    frontmatter.push(`description: ${JSON.stringify(schema.intro)}`);
    frontmatter.push(`date: ${today}`);
    frontmatter.push(`updated: ${today}`);
    frontmatter.push(`cluster: ${JSON.stringify(normCluster)}`);
    frontmatter.push("---\n");
    // Compose the MDX body.  We export the schema for runtime use, add a
    // heading, the introduction, the calculator component, then FAQs and
    // related calculators when available.
    let body = "";
    body += "import Calculator from '../../components/Calculator.astro';\n\n";
    body += `export const schema = ${JSON.stringify(schema, null, 2)}\n\n`;
    // The Calculator component renders the title, intro and FAQ internally
    // to avoid duplicate sections in the final page.
    // The Calculator component renders title, intro, examples, FAQ and
    // related calculators internally.  Avoid adding sections manually to
    // keep the MDX output lean and prevent duplicate headings.
    body += "<Calculator schema={schema} />\n";
    const mdxContent = frontmatter.join("\n") + body;
    const outPath = path.join(OUT_DIR, `${calc.slug}.mdx`);
    fs.writeFileSync(outPath, mdxContent, "utf-8");
    // Record publication in log
    log.push({ slug: calc.slug, date: today });
  }
  writeJSON(LOG_PATH, log);
  console.log(`Published ${toPublish.length} calculators`);
})();
