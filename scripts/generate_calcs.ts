// scripts/generate_calcs.ts
//
// Este generador crea calculadoras de forma programada a partir de un
// archivo JSON de datos. Lee `data/calculators.json` y publica hasta
// MAX calculadoras por día en `src/pages/calculators/`, respetando un
// registro de publicaciones en `meta/publish_log.json` para evitar
// duplicados. Cada MDX generado incluye título, descripción, ejemplos,
// preguntas frecuentes (FAQs) y un objeto `schema` con los metadatos
// necesarios para el componente Calculator y para JSON‑LD.
//
// Para facilitar la comprensión del sitio por parte de Google y otros
// buscadores, también generamos unas FAQs genéricas cuando no se
// proporcionan en los datos de entrada. Los ejemplos se calculan
// automáticamente a partir de la expresión matemática usando un
// evaluador seguro.

import fs from 'node:fs';
import path from 'node:path';

// Rutas básicas del proyecto
const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data', 'calculators.json');
const OUT_DIR = path.join(ROOT, 'src', 'pages', 'calculators');
const LOG_PATH = path.join(ROOT, 'meta', 'publish_log.json');

// Número máximo de calculadoras a generar por día; configurable vía
// variables de entorno MAX_PER_DAY o MAX_PER_DAY_GITHUB. Si no se
// proporciona, se usa 50 como valor por defecto.
const MAX = Number(process.env.MAX_PER_DAY || process.env.MAX_PER_DAY_GITHUB || 50);

// Fecha de hoy (AAAA-MM-DD) para registrar la publicación
const TODAY = new Date().toISOString().slice(0, 10);

// Lee JSON de forma segura
function readJSON(p: string, fallback: any) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return fallback;
  }
}

// Categorías canónicas. Algunos datos de entrada usan nombres
// alternativos (p. ej. "Finance & Loans"), así que normalizamos a
// nuestros slugs de categoría. Las claves están en minúsculas para
// simplificar comparaciones.
const CATEGORY_MAP: Record<string, string> = {
  'finance & loans': 'Finance',
  'percentages & ratios': 'Algebra',
  'finance': 'Finance',
  'business & commerce': 'Business',
  'health & fitness': 'Health',
  'health': 'Health',
  'geometry & math': 'Geometry',
  'math': 'Geometry',
  'conversions & units': 'Conversions',
  'conversions': 'Conversions',
  'misc': 'Other',
  'other': 'Other',
  'home & diy': 'Home & DIY',
  'technology': 'Technology',
  'time & date': 'Time & Date',
  'statistics': 'Statistics',
  'algebra': 'Algebra'
};

// Evaluador seguro de expresiones basado en el algoritmo Shunting‑yard.
// No utiliza eval() y por tanto evita ejecutar código arbitrario.
function evalExpr(expr: string, vars: Record<string, number>): number {
  const out: any[] = [];
  const ops: string[] = [];
  const prec: Record<string, number> = { '^': 4, '*': 3, '/': 3, '%': 3, '+': 2, '-': 2 };
  const right: Record<string, boolean> = { '^': true };
  let i = 0;
  const isSpace = (c: string) => /\s/.test(c);
  const isDigit = (c: string) => c >= '0' && c <= '9';
  const isLetter = (c: string) => /[A-Za-z_]/.test(c);
  const tokens: any[] = [];
  while (i < expr.length) {
    const c = expr[i];
    if (isSpace(c)) { i++; continue; }
    if (isDigit(c) || c === '.') {
      const s = i;
      while (i < expr.length && /[0-9.eE+\-]/.test(expr[i])) i++;
      tokens.push({ t: 'num', v: parseFloat(expr.slice(s, i)) });
      continue;
    }
    if (isLetter(c)) {
      const s2 = i;
      while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i])) i++;
      const name = expr.slice(s2, i);
      if (!(name in vars)) throw new Error('Unknown variable ' + name);
      tokens.push({ t: 'num', v: Number(vars[name]) });
      continue;
    }
    if ('+-*/%^()'.includes(c)) {
      tokens.push({ t: 'op', v: c });
      i++;
      continue;
    }
    throw new Error('Bad character in expression: ' + c);
  }
  for (const tok of tokens) {
    if (tok.t === 'num') { out.push(tok); continue; }
    const op = tok.v;
    if (op === '(') { ops.push(op); continue; }
    if (op === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') out.push({ t: 'op', v: ops.pop() });
      ops.pop();
      continue;
    }
    while (ops.length) {
      const top = ops[ops.length - 1];
      if (top === '(') break;
      if ((right[op] && prec[op] < prec[top]) || (!right[op] && prec[op] <= prec[top])) out.push({ t: 'op', v: ops.pop() });
      else break;
    }
    ops.push(op);
  }
  while (ops.length) out.push({ t: 'op', v: ops.pop() });
  const st: number[] = [];
  for (const t of out) {
    if (t.t === 'num') { st.push(t.v); continue; }
    const b = st.pop();
    const a = st.pop();
    let r: number;
    switch (t.v) {
      case '+': r = a + b; break;
      case '-': r = a - b; break;
      case '*': r = a * b; break;
      case '/': r = b === 0 ? NaN : a / b; break;
      case '%': r = b === 0 ? NaN : a % b; break;
      case '^': r = Math.pow(a, b); break;
      default: throw new Error('Unknown operator');
    }
    st.push(r);
  }
  return st.pop() ?? NaN;
}

// Determina valores de ejemplo para cada entrada. Si existe un mínimo
// definido en el objeto de entrada lo utilizamos, en caso contrario
// se asigna un valor razonable (10 o 1 para porcentajes).  Para tasas
// o porcentajes elegimos 10 para que el resultado sea fácil de leer.
function defaultSampleValue(input: any): number {
  if (input && typeof input === 'object') {
    if (typeof input.min === 'number' && input.min > 0) {
      return input.min + (input.step ?? 1);
    }
    const name = String(input.name || '').toLowerCase();
    if (name.includes('percent') || name.includes('rate') || name.includes('roi')) {
      return 10;
    }
    if (name.includes('year') || name.includes('month')) {
      return 2;
    }
    if (name.includes('weight') || name.includes('height')) {
      return 2;
    }
  }
  return 100;
}

// Genera un ejemplo de uso a partir de la expresión y las entradas.
function generateExample(calc: any): { description: string, inputs: Record<string, number>, result: number } {
  const vars: Record<string, number> = {};
  if (Array.isArray(calc.inputs)) {
    for (const inp of calc.inputs) {
      vars[inp.name] = defaultSampleValue(inp);
    }
  }
  let result = NaN;
  try {
    // Sustituimos ** por ^ para el evaluador
    const expr = (calc.expression || '').replace(/\*\*/g, '^');
    result = evalExpr(expr, vars);
  } catch (e) {
    // Fallback: resultado NaN
    result = NaN;
  }
  const parts = Object.keys(vars).map((k) => `${k} = ${vars[k]}`).join(', ');
  const desc = `For example, when ${parts}, the result is ${Number.isFinite(result) ? result : '…'}`;
  return { description: desc, inputs: vars, result };
}

// Genera preguntas frecuentes genéricas si no se proporcionan en el
// JSON de origen. Incluye tres preguntas básicas.
function generateFaqs(calc: any): { question: string, answer: string }[] {
  const title = calc.title || 'calculator';
  return [
    {
      question: `What is the ${title}?`,
      answer: calc.intro || `This tool helps you perform the ${title.toLowerCase()} operation.`,
    },
    {
      question: `How do I use the ${title}?`,
      answer: `Enter the values requested in the form fields and click the Calculate button to see the result.`,
    },
    {
      question: `Is the ${title} free to use?`,
      answer: `Yes, this calculator is completely free and works in your browser without needing any downloads.`,
    },
  ];
}

// Carga datos y log
const allCalcs = readJSON(DATA, []);
const log = readJSON(LOG_PATH, []);
const publishedSlugs = new Set(log.map((r: any) => r.slug));

// Asegura que las carpetas existen
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

// Selecciona los cálculos pendientes
const pending = allCalcs.filter((c: any) => !publishedSlugs.has(c.slug));
const toPublish = pending.slice(0, Math.max(1, Math.min(100, MAX)));

for (const calc of toPublish) {
  // Normaliza la categoría
  const clusterRaw = (calc.cluster || '').toLowerCase();
  const clusterNorm = CATEGORY_MAP[clusterRaw] || calc.cluster || 'General';

  // Genera ejemplo y FAQs si faltan
  const example = generateExample(calc);
  const examples = Array.isArray(calc.examples) && calc.examples.length > 0 ? calc.examples : [example.description];
  const faqs = Array.isArray(calc.faqs) && calc.faqs.length > 0 ? calc.faqs : generateFaqs(calc);

  // Construye objeto schema
  const schema = {
    slug: calc.slug,
    title: calc.title,
    locale: 'en',
    inputs: calc.inputs || [],
    expression: (calc.expression || '').replace(/\*\*/g, '^'),
    formula_js: calc.formula_js || '',
    units: calc.units || { input: '', output: '' },
    intro: calc.intro || '',
    examples,
    faqs,
    disclaimer: calc.disclaimer || 'Educational information, not professional advice.',
    schema_org: calc.schema_org || 'FAQPage|SoftwareApplication',
    cluster: clusterNorm,
    related: [] as string[],
  };

  // Determinar calculadoras relacionadas: elegimos las primeras 6 del
  // mismo grupo o del total si no hay suficientes. Ordenamos de
  // manera determinista para evitar saltos entre ejecuciones.
  const sameCluster = allCalcs.filter((c: any) => c.slug !== calc.slug && c.cluster === calc.cluster);
  const pool = sameCluster.length >= 6 ? sameCluster : allCalcs.filter((c: any) => c.slug !== calc.slug);
  schema.related = pool.slice(0, 6).map((c: any) => c.slug);

  // Descripción para meta: usa la introducción si existe
  const metaDesc = calc.intro || `Use the ${calc.title} to perform quick calculations.`;

  // Cuerpo MDX.  Incluye cabecera frontmatter con layout, título,
  // descripción, fechas y cluster.  El objeto schema se expone como
  // export para que el componente Calculator lo reciba.  También se
  // muestran ejemplos y FAQs en la página.
  const mdx = `---\n` +
    `layout: ../../layouts/BaseLayout.astro\n` +
    `title: ${calc.title}\n` +
    `description: ${metaDesc}\n` +
    `date: ${TODAY}\n` +
    `updated: ${TODAY}\n` +
    `cluster: ${clusterNorm}\n` +
    `---\n\n` +
    `import Calculator from '../../components/Calculator.astro';\n\n` +
    `export const schema = ${JSON.stringify(schema, null, 2)}\n\n` +
    `# ${calc.title}\n\n` +
    `${calc.intro || ''}\n\n` +
    `<Calculator schema={schema} />\n\n` +
    `## Examples\n\n` +
    examples.map((ex: string) => `- ${ex}`).join('\n') + `\n\n` +
    `## FAQ\n\n` +
    faqs.map((f: any) => `- **${f.question}**\n\n  ${f.answer}`).join('\n\n') + `\n\n` +
    `## Related calculators\n\n` +
    schema.related.map((slug) => `- [${slug.replace(/-/g, ' ')}](/calculators/${slug}/)`).join('\n') + `\n`;

  // Escribe el archivo MDX
  const outPath = path.join(OUT_DIR, `${calc.slug}.mdx`);
  fs.writeFileSync(outPath, mdx);
  // Registra la publicación
  log.push({ slug: calc.slug, date: TODAY });
}

// Guarda el registro actualizado
fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

console.log(`Published ${toPublish.length} calculators`);