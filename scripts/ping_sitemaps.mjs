
// scripts/ping_sitemaps.mjs
import https from 'node:https';

const urls = [
  'https://www.calcsimpler.com/sitemap-index.xml',
  'https://www.calcsimpler.com/sitemap.xml'
];
const endpoints = (u)=> [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(u)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(u)}`
];
function ping(url){
  return new Promise((resolve,reject)=>{
    https.get(url, res => { res.on('data', ()=>{}); res.on('end', ()=> resolve({url, status: res.statusCode})); }).on('error', reject);
  });
}
for (const u of urls) {
  for (const e of endpoints(u)) {
    try { const res = await ping(e); console.log('Pinged:', res.url, res.status); }
    catch { console.warn('Ping failed:', e); }
  }
}
