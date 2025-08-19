import { defineConfig } from 'astro/config';
if (!process.env.SITE_URL) { throw new Error('SITE_URL is required'); }
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
});
