// scripts/ping_sitemaps.js
// Ping major search engines to notify updated sitemaps after deployment.
// Usage: node scripts/ping_sitemaps.js

import https from 'node:https';

const site = process.env.SITE_URL;
if (!site) {
  console.error('SITE_URL environment variable is required');
  process.exit(1);
}
// Compose sitemap index URL. Ensure no double slash.
const sitemapUrl = `${site.replace(/\/$/, '')}/sitemap-index.xml`;
const targets = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
];

function ping(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        console.log(`Pinged ${url} - status ${res.statusCode}`);
        res.resume();
        resolve(res.statusCode);
      })
      .on('error', (err) => {
        console.error(`Error pinging ${url}:`, err.message);
        resolve(null);
      });
  });
}

async function main() {
  await Promise.all(targets.map(ping));
}

main();