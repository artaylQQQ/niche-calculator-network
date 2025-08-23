import https from 'node:https';
const site = process.env.SITE_URL || 'https://calcsimpler.com';
const sitemap = `${site.replace(/\/$/,'')}/sitemap-index.xml`;
[
  `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`
].forEach(url => {
  https.get(url, res => console.log('Ping', url, res.statusCode));
});
