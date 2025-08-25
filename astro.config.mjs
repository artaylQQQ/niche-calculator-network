import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Usa el valor de SITE_URL si existe, o un valor por defecto.
const SITE_URL = process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind({ config: { applyBaseStyles: true } }),
    mdx(),
    sitemap(),
  ],
});
