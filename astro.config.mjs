import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
});
