import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE_URL = process.env.SITE_URL || 'https://calcsimpler.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind({ config: { applyBaseStyles: true } }),
    mdx(),
    sitemap({
      // Quitamos sitemapFilename (no soportado en tu versión)
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
});
