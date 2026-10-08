import Image from './Img';
import { steps } from '../data/content';
import { img, alt } from './img';

export default function Experience() {
  return (
    <section id="experience" className="py-20 md:py-32">
      <div className="wrap">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The Experience</p>
            <h2 className="mt-2.5 text-h2">Made for people on holiday</h2>
          </div>
          <p className="max-w-[44ch] text-ink">
            You have a few days, not a few weeks. Everything is planned so your session fits around your trip.
          </p>
        </div>
        <div className="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="relative aspect-[4/3] overflow-hidden bg-paper md:sticky md:top-[110px] md:aspect-[4/5]">
            <Image
              src={img('sousse-shoreline-walk')}
              alt={alt('sousse-shoreline-walk')}
              fill
              sizes="(min-width: 768px) 42vw, 92vw"
              className="object-cover object-[50%_45%]"
            />
          </div>
          <ol className="grid">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t border-line py-8 last:border-b">
                <span className="font-serif text-[2.4rem] italic leading-none text-terra">{i + 1}</span>
                <div>
                  <h3 className="mb-2 text-[1.6rem] leading-tight">{s.title}</h3>
                  <p className="max-w-[54ch] text-ink">{s.body}</p>
                  <span className="mt-3 inline-block text-[11px] uppercase tracking-[0.14em] text-olive">{s.when}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
