/** 
 * Elimina calculadoras duplicadas cuyo slug termina en "-calculator" 
 * cuando existe otra calculadora con el mismo slug sin dicho sufijo.
 */
export function dedupeCalculators<T extends { slug: string }>(items: T[]): T[] {
  const slugSet = new Set(items.map(item => item.slug));
  return items.filter(item => {
    if (item.slug.endsWith('-calculator')) {
      const baseSlug = item.slug.slice(0, item.slug.length - 11);
      if (slugSet.has(baseSlug)) {
        return false;
      }
    }
    return true;
  });
}
