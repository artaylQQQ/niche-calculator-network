import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "src", "pages", "calculators");
const logPath = path.join(root, "meta", "publish_log.json");
const dataPath = path.join(root, "data", "calculators.json");
const category = process.env.CATEGORY || "Everyday & Misc";

// Basic random operation generator
const ops = [
  { symbol: "+", name: "Addition", example: { a: 2, b: 3, result: 5 } },
  { symbol: "-", name: "Subtraction", example: { a: 5, b: 2, result: 3 } },
  { symbol: "*", name: "Multiplication", example: { a: 4, b: 2, result: 8 } },
  { symbol: "/", name: "Division", example: { a: 8, b: 4, result: 2 } },
];
const op = ops[Math.floor(Math.random() * ops.length)];

const safeCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const slugBase = `${safeCategory}-${op.name.toLowerCase()}`;
const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;
const title = `${op.name} Calculator`;
const today = new Date().toISOString().slice(0, 10);

const schema = {
  slug,
  title,
  locale: "en",
  inputs: [
    { label: "Value A", name: "a", type: "number" },
    { label: "Value B", name: "b", type: "number" },
  ],
  expression: `a ${op.symbol} b`,
  intro: `Performs ${op.name.toLowerCase()} in the ${category} category.`,
  examples: [
    {
      description: `${op.example.a} ${op.symbol} ${op.example.b} = ${op.example.result}`,
    },
  ],
  faqs: [
    {
      question: `What does this calculator do?`,
      answer: `It performs basic ${op.name.toLowerCase()} operations.`,
    },
  ],
  disclaimer: "Educational information, not professional advice.",
  cluster: category,
  related: [],
};

const frontmatter = `---\nlayout: ../../layouts/CalculatorLayout.astro\ntitle: ${JSON.stringify(
  title,
)}\ndescription: ${JSON.stringify(
  schema.intro,
)}\ndate: ${today}\nupdated: ${today}\ncluster: ${JSON.stringify(
  category,
)}\n---\n`;

const body = `import Calculator from '../../components/Calculator.astro';\n\nexport const schema = ${JSON.stringify(
  schema,
  null,
  2,
)}\n\n<Calculator schema={schema} />\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${slug}.mdx`), frontmatter + body, "utf8");

const log = fs.existsSync(logPath)
  ? JSON.parse(fs.readFileSync(logPath, "utf8"))
  : [];
log.push({ slug, date: today });
fs.mkdirSync(path.dirname(logPath), { recursive: true });
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

const data = fs.existsSync(dataPath)
  ? JSON.parse(fs.readFileSync(dataPath, "utf8"))
  : [];
data.push({
  slug,
  title,
  cluster: category.toLowerCase(),
  description: schema.intro,
  inputs: schema.inputs,
  expression: schema.expression,
  examples: schema.examples,
  faqs: schema.faqs,
});
fs.mkdirSync(path.dirname(dataPath), { recursive: true });
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Invented calculator ${slug}`);
