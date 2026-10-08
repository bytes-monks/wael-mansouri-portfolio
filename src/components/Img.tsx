import type { CSSProperties } from 'react';
import manifest from '../generated/images.json';
import { asset } from '../lib/site';

type Entry = { width: number; height: number; widths: number[] };
const images: Record<string, Entry> = manifest;

type Props = {
  src: string;
  alt: string;
  /** Same meaning as the `sizes` attribute. Defaults to full viewport width. */
  sizes?: string;
  /** Cover the nearest positioned ancestor, like next/image's `fill`. */
  fill?: boolean;
  /** Above-the-fold image: load eagerly at high priority. */
  priority?: boolean;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * A plain <img> with a srcset over the variants scripts/images.mjs generates.
 * Keeps next/image's prop names so the section components did not change.
 */
export default function Img({ src, alt, sizes = '100vw', fill, priority, width, height, className = '', style }: Props) {
  const slug = src.replace(/^\/images\//, '').replace(/\.webp$/, '');
  const entry = images[slug];
  if (!entry) throw new Error(`Img: no manifest entry for ${src} — is it in public/images/?`);

  const srcSet = entry.widths
    .map((w) => `${asset(w === entry.width ? src : `/images/w/${slug}-${w}.webp`)} ${w}w`)
    .join(', ');

  return (
    <img
      src={asset(src)}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={fill ? undefined : (width ?? entry.width)}
      height={fill ? undefined : (height ?? entry.height)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={fill ? `absolute inset-0 h-full w-full ${className}` : className}
      style={style}
    />
  );
}
