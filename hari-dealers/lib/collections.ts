export const GIRLS_VARIETIES = [
  'Tops',
  'Fashion Tops',
  'Shawls',
  'Leggings',
  'Ankle Fit',
  'Palazzo',
] as const;

export type GirlsVariety = (typeof GIRLS_VARIETIES)[number];

export function getVarietySlug(variety: string) {
  return variety.toLowerCase().replace(/\s+/g, '-');
}

export function getVarietyFromSlug(slug: string) {
  return GIRLS_VARIETIES.find((variety) => getVarietySlug(variety) === slug);
}
