
// scripts/check_links.mjs
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(),'dist');
let broken = 0;
function walk(dir){
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.html')) checkFile(p);
  }
}
function checkFile(file){
  const html = fs.readFileSync(file,'utf-8');
  const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map(m=>m[1]);
  for (const h of hrefs){
    if (h.startsWith('http')) continue;
    if (h.startsWith('#')) continue;
    let target = h;
    if (target.endswith('/')) target += 'index.html';
    const fp = path.join(path.dirname(file), target);
    if (!fs.existsSync(fp)) {
      console.warn('Broken link?', h, 'in', file);
      broken++;
    }
  }
}
walk(dist);
if (broken > 0) {
  console.error('Broken links:', broken);
  process.exit(1);
} else {
  console.log('No broken links found.');
}
