import Image from './Img';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shots, type Category } from '../data/shots';

const TABS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All stories' },
  { id: 'couples', label: 'Couples & Honeymoons' },
  { id: 'solo', label: 'Solo Editorial' },
  { id: 'travel', label: 'Intimate Travel' },
];

export default function Stories() {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = useMemo(
    () => shots.map((s, i) => ({ s, i })).filter(({ s }) => filter === 'all' || s.category === filter),
    [filter],
  );
  const pos = active === null ? -1 : visible.findIndex((v) => v.i === active);

  const step = useCallback(
    (d: number) => {
      if (pos < 0) return;
      setActive(visible[(pos + d + visible.length) % visible.length].i);
    },
    [pos, visible],
  );

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, step]);

  const current = active === null ? null : shots[active];

  return (
    <section id="stories" className="pb-20 pt-5 md:pb-32">
      <div className="wrap">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Stories</p>
            <h2 className="mt-2.5 text-h2">Recent sessions</h2>
          </div>
          <p className="max-w-[44ch] text-ink">Real clients, real trips. Tap any frame to view it full-screen.</p>
        </div>

        <div role="group" aria-label="Filter by shoot style" className="mb-7 flex flex-wrap gap-1.5">
          {TABS.map((t) => {
            const n = t.id === 'all' ? shots.length : shots.filter((s) => s.category === t.id).length;
            const on = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(t.id)}
                className={`border px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] ${
                  on ? 'border-onyx bg-onyx text-bone' : 'border-line text-ink hover:border-onyx'
                }`}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums opacity-55">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="columns-1 gap-3.5 sm:columns-2 lg:columns-3">
          {visible.map(({ s, i }) => (
            <figure key={s.src} className="mb-3.5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View ${s.title}, ${s.place}`}
                className="group block w-full cursor-zoom-in overflow-hidden bg-paper"
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </button>
              <figcaption className="flex justify-between gap-2.5 px-0.5 pt-2 text-xs text-ink">
                <em className="font-serif text-[1.05rem] text-onyx">{s.title}</em>
                <span>{s.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[60] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-3 bg-[rgba(14,14,14,0.96)] px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[calc(18px+env(safe-area-inset-top))]"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-bone">
            <span className="tabular-nums">
              {pos + 1} / {visible.length}
            </span>
            <button ref={closeRef} type="button" onClick={() => setActive(null)} className="border border-bone/40 px-4 py-3 hover:border-bone">
              Close
            </button>
          </div>
          <div className="relative min-h-0">
            <Image src={current.src} alt={current.alt} fill priority sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-center gap-3.5 text-bone">
            <button type="button" onClick={() => step(-1)} className="border border-bone/40 px-4 py-3 text-xs uppercase tracking-[0.14em] hover:border-bone">
              ← Prev
            </button>
            <span className="min-w-0 text-center font-serif text-lg">
              {current.title} · {current.place}
            </span>
            <button type="button" onClick={() => step(1)} className="border border-bone/40 px-4 py-3 text-xs uppercase tracking-[0.14em] hover:border-bone">
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
