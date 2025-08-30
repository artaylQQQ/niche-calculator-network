import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "src", "pages", "calculators");
const LOG_PATH = path.join(ROOT, "meta", "publish_log.json");

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

const category = process.env.CATEGORY || "Everyday & Misc";
const today = new Date().toISOString().slice(0, 10);
const log = readJSON(LOG_PATH);
const slugBase = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const existingCount = log.filter((r) => r.slug.startsWith(`${slugBase}-calc-`)).length;
const index = existingCount + 1;
const slug = `${slugBase}-calc-${index}`;
const title = `${category} Calculator ${index}`;

// Create random expression with 2-3 variables
const varNames = ["x", "y", "z", "w"];
const ops = ["+", "-", "*", "/"];
const varCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 vars
const inputs = varNames.slice(0, varCount).map((n) => ({
  name: n,
  label: n.toUpperCase(),
  type: "number",
}));
let expression = inputs[0].name;
for (let i = 1; i < inputs.length; i++) {
  const op = ops[Math.floor(Math.random() * ops.length)];
  expression += ` ${op} ${inputs[i].name}`;
}

const exampleDesc = inputs
  .map((inp, i) => `${inp.label}=${i + 1}`)
  .join(", ");

const schema = {
  slug,
  title,
  locale: "en",
  inputs,
  expression,
  intro: `Auto-generated calculator for ${category}.`,
  examples: [{ description: exampleDesc }],
  faqs: [],
  disclaimer: "Educational use only.",
  cluster: category,
  related: [],
};

const frontmatter = [
  "---",
  "layout: ../../layouts/CalculatorLayout.astro",
  `title: ${JSON.stringify(title)}`,
  `description: ${JSON.stringify(schema.intro)}`,
  `date: ${today}`,
  `updated: ${today}`,
  `cluster: ${JSON.stringify(category)}`,
  "---\n",
].join("\n");

let body = "";
body += "import Calculator from '../../components/Calculator.astro';\n\n";
body += `export const schema = ${JSON.stringify(schema, null, 2)}\n\n`;
body += "<Calculator schema={schema} />\n\n";
if (schema.examples && schema.examples.length) {
  body += "## Examples\n\n";
  schema.examples.forEach((ex) => {
    body += `- ${ex.description}\n`;
  });
  body += "\n";
}

const content = frontmatter + body;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, `${slug}.mdx`), content, "utf-8");

log.push({ slug, date: today });
writeJSON(LOG_PATH, log);

console.log(`Generated ${slug}`);
