import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * Advanced calculator generator (plain JS)
 *
 * Reads calculator definitions from `data/calculators.json` and writes
 * MDX pages into `src/pages/calculators/`.  A publish log stored in
 * `meta/publish_log.json` prevents previously published calculators from
 * being regenerated.  The `MAX_PER_DAY` environment variable controls
 * how many new calculators are emitted on each run.  Values are
* clamped between 20 and 100 to ensure a steady flow of fresh
* content without overloading the site.  Title, intro, examples,
* related calculators and FAQ content are rendered by the Calculator
* component itself.
*/

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "calculators.json");
const OUT_DIR = path.join(ROOT, "src", "pages", "calculators");
const LOG_PATH = path.join(ROOT, "meta", "publish_log.json");

// Mapping of various cluster names to one of the eight top‑level
// categories.  All keys are lower‑case for case‑insensitive lookups.
const CATEGORY_MAP = {
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

// Utility to safely parse JSON with fallback.
function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (_) {
    return fallback;
  }
}

function writeJSON(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

// Replace ** with ^ to suit the calculator evaluator.
function sanitizeExpr(expr) {
  return typeof expr === "string" ? expr.replace(/\*\*/g, "^") : "";
}

function pickRelated(base, all, count = 6) {
  const same = all.filter(
    (c) => c.slug !== base.slug && c.cluster === base.cluster,
  );
  const pool =
    same.length >= count ? same : all.filter((c) => c.slug !== base.slug);
  return pool.slice(0, count).map((c) => c.slug);
}

// Immediately invoked main function
(function run() {
  const items = readJSON(DATA_PATH, []);
  const log = readJSON(LOG_PATH, []);
  const published = new Set(log.map((r) => r.slug));
  const backlogAll = items.filter((c) => !published.has(c.slug));
  const categoryFilter = (process.env.CATEGORY || "").toLowerCase();
  const backlog = categoryFilter
    ? backlogAll.filter((c) => {
        const raw = (c.cluster || "").toString().toLowerCase();
        const norm = (CATEGORY_MAP[raw] || c.cluster || "").toLowerCase();
        return norm === categoryFilter;
      })
    : backlogAll;
  if (!backlog.length) {
    console.log(
      categoryFilter
        ? `No new calculators to generate for category ${categoryFilter}; inventing one`
        : "No new calculators to generate; inventing one",
    );
    execSync(`node ${path.join(ROOT, "scripts", "invent_calculator.js")}`, {
      stdio: "inherit",
    });
    return;
  }
  const rawMax = parseInt(
    process.env.MAX_PER_DAY || process.env.MAX_PER_DAY_GITHUB || "50",
    10,
  );
  const limit = Math.max(1, Math.min(100, isNaN(rawMax) ? 50 : rawMax));
  const today = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const toPublish = backlog.slice(0, limit);
  for (const calc of toPublish) {
    const rawCluster = (calc.cluster || "").toString().toLowerCase();
    const normCluster =
      CATEGORY_MAP[rawCluster] || calc.cluster || "Everyday & Misc";
    const related = pickRelated(calc, items);
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
    const frontmatter = [];
    frontmatter.push("---");
    frontmatter.push("layout: ../../layouts/CalculatorLayout.astro");
    frontmatter.push(`title: ${JSON.stringify(calc.title)}`);
    frontmatter.push(`description: ${JSON.stringify(schema.intro)}`);
    frontmatter.push(`date: ${today}`);
    frontmatter.push(`updated: ${today}`);
    frontmatter.push(`cluster: ${JSON.stringify(normCluster)}`);
    frontmatter.push("---\n");
    let body = "";
    body += "import Calculator from '../../components/Calculator.astro';\n\n";
    body += `export const schema = ${JSON.stringify(schema, null, 2)}\n\n`;
    // Title, intro and FAQ are rendered inside the Calculator component to
    // avoid duplicated sections in the generated pages.
    // The Calculator component renders title, intro, examples, FAQ and related
    // calculators internally to prevent duplicate sections in the MDX output.
    body += "<Calculator schema={schema} />\n";
    const mdxContent = frontmatter.join("\n") + body;
    const outPath = path.join(OUT_DIR, `${calc.slug}.mdx`);
    fs.writeFileSync(outPath, mdxContent, "utf-8");
    log.push({ slug: calc.slug, date: today });
  }
  writeJSON(LOG_PATH, log);
  console.log(`Published ${toPublish.length} calculators`);
})();
