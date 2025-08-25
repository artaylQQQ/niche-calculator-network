// scripts/validate_schema.mjs — quick JSON-LD sanity check
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'schema');
let ok = true;
if (!fs.existsSync(dir)) {
  console.log('No schema directory to validate.');
  process.exit(0);
}
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  const p = path.join(dir, f);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    if (!Array.isArray(data) || !data.length) throw new Error('Array expected.');
  } catch (e) {
    ok = false;
    console.error('Invalid JSON-LD:', f, e.message);
  }
}
if (!ok) process.exit(1);
console.log('JSON-LD files look valid.');
