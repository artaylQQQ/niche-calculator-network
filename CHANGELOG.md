# Changelog

## [0.34.1] - 2025-08-22
### Changed
- Home con **8 categorías** e **iconos**.
- Nuevas páginas `/categories/` y `/categories/[slug]/` con lectura de `data/calculators.json`.
- Navbar con enlace **Categories** y tokens de estilo.
- Build fixes: **@astrojs/mdx** + integración en `astro.config.mjs`, **Node >=18**, import JSON dinámico.
- `robots.txt` con Sitemap absoluto y `postbuild` con ping de sitemaps.


## V036 - 2025-08-24
- New generator with JSON-LD, examples, FAQs, daily 20–100 docs
- Accessible Calculator component with safe expression parser
- 8-category home, responsive UI tweaks
- Added nightly GitHub Action for generate→build→deploy→ping
- Link checker & JSON-LD validator in CI
- robots.txt referencing sitemap-index; vercel.json headers
