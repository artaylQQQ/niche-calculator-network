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
    // Configure the sitemap to output a single file and supply sensible
    // defaults for change frequency and priority.  Without these
    // options Astro may split the sitemap into multiple segments when
    // publishing many pages.  Search engines appreciate a simple
    // sitemap at `/sitemap.xml`.
    sitemap({
      sitemapFilename: 'sitemap.xml',
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
});
