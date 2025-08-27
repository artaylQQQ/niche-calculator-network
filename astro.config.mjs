import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://calcsimpler.com';

export default defineConfig({
  site,
  integrations: [mdx(), sitemap()],
  output: 'static'
});