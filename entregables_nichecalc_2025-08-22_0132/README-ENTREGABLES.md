# Entregables — Niche Calculator Network

## Contenido
- `report.md`: Informe completo (auditoría, roadmap, SEO/monetización, diseño, checklists).
- `homepage.html`: Maqueta de homepage minimalista (HTML + Tailwind CDN).
- `templates/calculator.html`: Plantilla base de calculadora con slots.
- `js/eval.js`: Evaluador seguro y ligero para fórmulas.
- `data/calculators.json`: 3 calculadoras de ejemplo (BMI, Loan Payment, Rule of Three).
- `scripts/generate-calculators.js`: Generador JSON → páginas estáticas (salida en `dist/`).
- `scripts/test.js`: Tests simples de fórmulas.

## Uso rápido
```bash
# 1) Generar páginas estáticas
node scripts/generate-calculators.js

# 2) (opcional) Servir dist/ con un server estático
python3 -m http.server -d dist 8787

# 3) Probar fórmulas
node scripts/test.js
```
