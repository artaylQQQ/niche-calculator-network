import fs from "node:fs";
import path from "node:path";

// Map human‑readable categories to canonical slugs used in the site
const CATEGORY_SLUGS = {
  Finance: "finance",
  Health: "health",
  Conversions: "conversions",
  Math: "math",
  Technology: "technology",
  "Date & Time": "date & time",
  "Home & DIY": "home & diy",
  "Everyday & Misc": "other",
};

// Template calculators per category to keep output varied and useful
const TEMPLATES = {
  finance: [
    {
      slug: "simple-interest",
      title: "Simple Interest Calculator",
      intro: "Compute interest earned with the simple interest formula.",
      inputs: [
        { label: "Principal", name: "p", type: "number" },
        { label: "Rate (%)", name: "r", type: "number" },
        { label: "Time (years)", name: "t", type: "number" },
      ],
      expression: "(p * r * t) / 100",
      examples: [{ description: "1000 at 5% for 2 years = 100" }],
      faqs: [
        {
          question: "What is simple interest?",
          answer: "Interest calculated only on the principal amount.",
        },
      ],
    },
    {
      slug: "loan-payment",
      title: "Loan Payment Calculator",
      intro: "Estimate the monthly payment for a fixed‑rate loan.",
      inputs: [
        { label: "Principal", name: "p", type: "number" },
        { label: "Annual Rate (%)", name: "r", type: "number" },
        { label: "Years", name: "n", type: "number" },
      ],
      expression: "(p * (r/1200)) / (1 - (1 + (r/1200)) ** (-n * 12))",
      examples: [{ description: "10000 at 5% for 5 years ≈ 188.71" }],
      faqs: [
        {
          question: "How are payments calculated?",
          answer: "Using the standard amortisation formula.",
        },
      ],
    },
  ],
  health: [
    {
      slug: "bmi",
      title: "BMI Calculator",
      intro: "Estimate Body Mass Index from height and weight.",
      inputs: [
        { label: "Weight (kg)", name: "w", type: "number" },
        { label: "Height (cm)", name: "h", type: "number" },
      ],
      expression: "w / ((h / 100) ** 2)",
      examples: [{ description: "70 kg & 170 cm ≈ 24.22" }],
      faqs: [
        {
          question: "What is BMI?",
          answer:
            "Body Mass Index is a simple index of weight-for-height used to classify underweight, overweight and obesity.",
        },
      ],
    },
    {
      slug: "calorie-burn",
      title: "Calorie Burn Calculator",
      intro: "Estimate calories burned from MET value and weight.",
      inputs: [
        { label: "MET value", name: "m", type: "number" },
        { label: "Weight (kg)", name: "w", type: "number" },
        { label: "Hours", name: "h", type: "number" },
      ],
      expression: "m * 3.5 * w * h / 200",
      examples: [{ description: "MET 8, 70 kg, 1 h ≈ 980" }],
      faqs: [
        {
          question: "What is MET?",
          answer:
            "Metabolic Equivalent of Task, a measure of exercise intensity.",
        },
      ],
    },
  ],
  conversions: [
    {
      slug: "miles-to-km",
      title: "Miles to Kilometres Converter",
      intro: "Convert distance in miles to kilometres.",
      inputs: [{ label: "Miles", name: "m", type: "number" }],
      expression: "m * 1.60934",
      examples: [{ description: "10 miles = 16.09 km" }],
      faqs: [],
    },
    {
      slug: "kg-to-lb",
      title: "Kilograms to Pounds Converter",
      intro: "Convert weight in kilograms to pounds.",
      inputs: [{ label: "Kilograms", name: "k", type: "number" }],
      expression: "k * 2.20462",
      examples: [{ description: "5 kg = 11.02 lb" }],
      faqs: [],
    },
  ],
  math: [
    {
      slug: "area-circle",
      title: "Area of a Circle Calculator",
      intro: "Compute the area of a circle from its radius.",
      inputs: [{ label: "Radius", name: "r", type: "number" }],
      expression: "Math.PI * r ** 2",
      examples: [{ description: "r = 3 ⇒ 28.27" }],
      faqs: [],
    },
    {
      slug: "pythagorean",
      title: "Pythagorean Theorem Calculator",
      intro: "Calculate the hypotenuse of a right triangle.",
      inputs: [
        { label: "Side A", name: "a", type: "number" },
        { label: "Side B", name: "b", type: "number" },
      ],
      expression: "Math.sqrt(a ** 2 + b ** 2)",
      examples: [{ description: "3 and 4 ⇒ 5" }],
      faqs: [],
    },
  ],
  technology: [
    {
      slug: "binary-to-decimal",
      title: "Binary to Decimal Converter",
      intro: "Convert a binary number to decimal.",
      inputs: [{ label: "Binary", name: "b", type: "text" }],
      expression: "parseInt(b, 2)",
      examples: [{ description: "1010₂ = 10" }],
      faqs: [],
    },
    {
      slug: "download-time",
      title: "Download Time Calculator",
      intro: "Estimate download time for a file size and speed.",
      inputs: [
        { label: "File size (MB)", name: "s", type: "number" },
        { label: "Speed (Mbps)", name: "v", type: "number" },
      ],
      expression: "(s * 8) / v",
      examples: [{ description: "100 MB at 20 Mbps = 40 s" }],
      faqs: [],
    },
  ],
  "date & time": [
    {
      slug: "minutes-to-hours",
      title: "Minutes to Hours Converter",
      intro: "Convert minutes into hours.",
      inputs: [{ label: "Minutes", name: "m", type: "number" }],
      expression: "m / 60",
      examples: [{ description: "120 minutes = 2 hours" }],
      faqs: [],
    },
    {
      slug: "days-to-weeks",
      title: "Days to Weeks Converter",
      intro: "Convert days into weeks.",
      inputs: [{ label: "Days", name: "d", type: "number" }],
      expression: "d / 7",
      examples: [{ description: "14 days = 2 weeks" }],
      faqs: [],
    },
  ],
  "home & diy": [
    {
      slug: "paint",
      title: "Paint Coverage Calculator",
      intro: "Estimate paint needed for a rectangular room.",
      inputs: [
        { label: "Length (m)", name: "l", type: "number" },
        { label: "Width (m)", name: "w", type: "number" },
        { label: "Height (m)", name: "h", type: "number" },
        { label: "Coverage (m²/L)", name: "c", type: "number" },
      ],
      expression: "((2*l*h)+(2*w*h)+(l*w)) / c",
      examples: [{ description: "Room 4×3×2.5 with 10 m²/L ≈ 4.1 L" }],
      faqs: [],
    },
    {
      slug: "tile",
      title: "Tile Quantity Calculator",
      intro: "Estimate number of tiles required for a floor.",
      inputs: [
        { label: "Floor area (m²)", name: "a", type: "number" },
        { label: "Tile area (m²)", name: "t", type: "number" },
      ],
      expression: "a / t",
      examples: [{ description: "20 m² floor with 0.25 m² tiles = 80 tiles" }],
      faqs: [],
    },
  ],
  other: [
    {
      slug: "tip",
      title: "Tip Calculator",
      intro: "Calculate the tip amount from bill and percentage.",
      inputs: [
        { label: "Bill ($)", name: "b", type: "number" },
        { label: "Tip (%)", name: "p", type: "number" },
      ],
      expression: "b * (p / 100)",
      examples: [{ description: "$50 at 15% = $7.50" }],
      faqs: [],
    },
    {
      slug: "discount",
      title: "Discount Calculator",
      intro: "Determine final price after a percentage discount.",
      inputs: [
        { label: "Price ($)", name: "p", type: "number" },
        { label: "Discount (%)", name: "d", type: "number" },
      ],
      expression: "p - p * (d / 100)",
      examples: [{ description: "$80 with 25% off = $60" }],
      faqs: [],
    },
  ],
};

const root = process.cwd();
const outDir = path.join(root, "src", "pages", "calculators");
const logPath = path.join(root, "meta", "publish_log.json");
const dataPath = path.join(root, "data", "calculators.json");

const inputCategory = process.env.CATEGORY || "Everyday & Misc";
const cluster = CATEGORY_SLUGS[inputCategory] || inputCategory.toLowerCase();
const templates = TEMPLATES[cluster] || TEMPLATES.other;
const tpl = templates[Math.floor(Math.random() * templates.length)];

function makeSlug(base) {
  return base.endsWith("-calculator") || base.endsWith("-converter")
    ? base
    : base + "-calculator";
}
const baseSlug = makeSlug(tpl.slug);
let slug = baseSlug;
let counter = 2;
while (fs.existsSync(path.join(outDir, slug + ".mdx"))) {
  slug = baseSlug + "-" + counter++;
}
const today = new Date().toISOString().slice(0, 10);

const inputs = tpl.inputs.map((i) => ({
  ...i,
  placeholder: i.placeholder || "Enter " + i.label.toLowerCase(),
}));

const intro =
  tpl.intro.replace(/\s*$/, "") + " Enter the values and press Calculate.";
const faqs =
  tpl.faqs && tpl.faqs.length
    ? tpl.faqs
    : [{ question: "What does the " + tpl.title + " do?", answer: intro }];

const schema = {
  slug,
  title: tpl.title,
  locale: "en",
  inputs,
  expression: tpl.expression,
  intro,
  examples: tpl.examples,
  faqs,
  disclaimer: "Educational information, not professional advice.",
  cluster,
  related: [],
};

const frontmatter = `---\nlayout: ../../layouts/CalculatorLayout.astro\ntitle: ${JSON.stringify(
  tpl.title,
)}\ndescription: ${JSON.stringify(
  intro,
)}\ndate: ${today}\nupdated: ${today}\ncluster: ${JSON.stringify(
  cluster,
)}\n---\n`;

const body = `import Calculator from '../../components/Calculator.astro';\n\nexport const schema = ${JSON.stringify(
  schema,
  null,
  2,
)}\n\n<Calculator schema={schema} />\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, slug + ".mdx"), frontmatter + body, "utf8");

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
  title: tpl.title,
  cluster,
  intro,
  inputs,
  expression: tpl.expression,
  examples: tpl.examples,
  faqs,
});
fs.mkdirSync(path.dirname(dataPath), { recursive: true });
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Invented calculator ${slug}`);
