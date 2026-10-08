import { imageAlt } from '../data/shots';

export const img = (slug: string) => `/images/${slug}.webp`;
export const alt = (slug: string) => imageAlt[slug] ?? '';
