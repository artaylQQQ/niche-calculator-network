// file: scripts/test.js
const fs = require('fs');
const path = require('path');
function evaluate(expr, vars) {
  // minimal evaluation via Function after sanitization
  const allowed = /^[0-9+\-*/().\s*a-zA-Z_]*\^?[*]*$/;
  // NOTE: For production, use a proper parser. This is for quick local checks.
  let e = expr.replace(/\^/g, '**');
  Object.entries(vars).forEach(([k,v]) => { e = e.replace(new RegExp(`\\b${k}\\b`, 'g'), String(v)); });
  // eslint-disable-next-line no-new-func
  return Function(`return (${e});`)();
}
const calcs = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','calculators.json'),'utf-8'));
for (const c of calcs) {
  if (c.examples && c.examples.length) {
    for (const ex of c.examples) {
      const r = evaluate(c.expression, ex.input);
      const ok = Math.abs(r - ex.result) < 0.01;
      console.log(c.slug, ok ? 'OK' : 'FAILED', r, 'vs', ex.result);
    }
  } else {
    console.log(c.slug, 'no examples to test');
  }
}
