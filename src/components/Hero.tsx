import Image from './Img';
import OpenInquiry from './OpenInquiry';
import GoldenHour from './GoldenHour';
import { img, alt } from './img';

export default function Hero() {
  return (
    <section aria-label="Introduction" className="pb-14 pt-[120px] md:pb-24">
      <div className="wrap grid items-center gap-10 md:grid-cols-2 lg:gap-20">
        <div className="min-w-0">
          <p className="eyebrow">Sidi Bou Said · Carthage · Sousse · El Jem · Djerba · Sahara</p>
          <h1 className="mt-4 text-hero font-normal">
            Editorial vacation &amp; couple photography <em className="text-terra">across Tunisia</em>
          </h1>
          <p className="mt-6 max-w-[40ch] text-base text-ink">
            Cinematic portraits for travellers, honeymooners and couples visiting Tunisia. Two-thousand-year-old arches,
            Mediterranean light, and your first images within 48 hours, before your flight home.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <OpenInquiry>Book your dates</OpenInquiry>
            <a href="#destinations" className="btn btn-ghost">
              Explore locations
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-7 border-t border-line pt-6">
            {[
              ['48h', 'Sneak peeks'],
              ['EN · FR · AR', 'Shoots in your language'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-serif text-3xl tabular-nums">{v}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink">{l}</p>
              </div>
            ))}
            <div>
              <p className="font-serif text-3xl tabular-nums">
                <GoldenHour />
              </p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink">Golden hour tonight</p>
            </div>
          </div>
        </div>
        <div className="relative pb-10 pl-10 md:pb-16 md:pl-16">
          <div className="relative aspect-[4/5] max-h-[78vh] w-full overflow-hidden bg-paper">
            <Image
              src={img('el-jem-maternity-forehead')}
              alt={alt('el-jem-maternity-forehead')}
              fill
              priority
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <span className="absolute right-3.5 top-3.5 bg-bone px-2.5 py-2 text-[11px] uppercase tracking-[0.14em]">
            El Jem amphitheatre
          </span>
          <div className="absolute bottom-0 left-0 aspect-[2/3] w-[38%] overflow-hidden border-8 border-bone bg-paper">
            <Image
              src={img('sousse-engagement-ring-kiss')}
              alt={alt('sousse-engagement-ring-kiss')}
              fill
              sizes="20vw"
              className="object-cover object-[50%_35%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
