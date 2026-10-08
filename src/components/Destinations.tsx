import Image from './Img';
import { destinations, moreLocations } from '../data/content';
import { img, alt } from './img';

export default function Destinations() {
  return (
    <section id="destinations" className="bg-paper py-20 md:py-32">
      <div className="wrap">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Destinations</p>
            <h2 className="mt-2.5 text-h2">Four backdrops, one country</h2>
          </div>
          <p className="max-w-[44ch] text-ink">
            Every session includes location advice timed to the light on your dates. Most clients pick one; the
            Full-Day Story combines two or three.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d, i) => (
            <article key={d.name} className={`grid content-start gap-3.5 ${i % 2 ? 'lg:mt-14' : ''}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                <Image
                  src={img(d.image)}
                  alt={alt(d.image)}
                  fill
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 92vw"
                  className="object-cover"
                  style={{ objectPosition: d.focus }}
                />
              </div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-olive">{d.meta}</p>
              <h3 className="text-[1.6rem] leading-none">{d.name}</h3>
              <p className="text-sm text-ink">{d.body}</p>
              <p className="flex justify-between gap-2.5 border-t border-line pt-2.5 text-xs tabular-nums">
                <span>Best light</span>
                <span>{d.light}</span>
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid items-end gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[1.4fr_1fr_1fr]">
          {moreLocations.map((m) => (
            <figure key={m.title} className={`grid gap-2.5 ${m.wide ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
              <div className={`relative overflow-hidden bg-bone ${m.wide ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}>
                <Image src={img(m.image)} alt={alt(m.image)} fill sizes="(min-width: 1024px) 35vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="text-[13px] text-ink">
                <b className="block font-serif text-lg font-medium text-onyx">{m.title}</b>
                {m.body}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
