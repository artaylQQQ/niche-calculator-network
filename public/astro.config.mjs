import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
if (!process.env.SITE_URL) { throw new Error('SITE_URL is required'); }
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL || 'https://calcsimpler.com';

export default defineConfig({
  // unify all integrations into a single array. Tailwind should run alongside mdx and sitemap.
  site: SITE_URL,
  integrations: [
    tailwind({ config: { applyBaseStyles: true } }),
    mdx(),
    sitemap(),
  ],
});
