/**
 * Remove duplicate calculators whose slug ends with "-calculator"
 * when there is also a version without that suffix.
 * Accepts items with a `slug` string property.
 */
export function dedupeCalculators<T extends { slug: string }>(items: T[]): T[] {
  const slugSet = new Set(items.map((i) => i.slug));
  const out: T[] = [];
  for (const it of items) {
    const s = it.slug;
    if (s.endsWith("-calculator")) {
      const base = s.slice(0, -11);
      if (slugSet.has(base)) continue; // drop legacy duplicate
    }
    out.push(it);
  }
  return out;
}
