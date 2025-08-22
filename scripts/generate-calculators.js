// file: scripts/generate-calculators.js
const fs = require('fs');
const path = require('path');
const tpl = fs.readFileSync(path.join(__dirname, '..', 'templates', 'calculator.html'), 'utf-8');
const calcs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'calculators.json'), 'utf-8'));

function renderTemplate(tpl, data) {
  let html = tpl;
  html = html.replace(/{{title}}/g, data.title)
             .replace(/{{description}}/g, data.description)
             .replace(/{{result_unit}}/g, data.result_unit || '')
             .replace(/{{schema_org}}/g, data.schema_org || '{}')
             .replace('{{expression}}', data.expression);

  // inputs
  const start = '<!-- iterar inputs -->';
  const list = (data.inputs || []).map(i => `
        <div>
          <label class="block mb-1" for="${i.name}">${i.label} ${i.unit ? `<span class="text-xs text-slate-500">${i.unit}</span>` : ''}</label>
          <input id="${i.name}" name="${i.name}" type="${i.type}" step="any" required class="w-full border rounded p-2">
        </div>`).join('');
  html = html.replace(start, list);

  // FAQs
  const faqStart = '<section class="mt-10">';
  const idx = html.indexOf(faqStart);
  if (idx !== -1) {
    const faqs = (data.faqs || []).map(f => `
        <details class="mb-2">
          <summary class="font-medium cursor-pointer">${f.question}</summary>
          <p class="mt-1 text-slate-700">${f.answer}</p>
        </details>`).join('');
    html = html.replace(faqStart, `${faqStart}\n${faqs}`);
  }
  return html;
}

for (const c of calcs) {
  const outDir = path.join('dist', 'calculators', c.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), renderTemplate(tpl, c));
  console.log('Generated', c.slug);
}
