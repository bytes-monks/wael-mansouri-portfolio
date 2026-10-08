import { useState } from 'react';
import { packages, type Currency } from '../data/content';
import OpenInquiry from './OpenInquiry';

const fmt = (n: number, c: Currency) => (c === 'eur' ? '€' : '$') + n.toLocaleString('en-US');

export default function Investment() {
  const [cur, setCur] = useState<Currency>('eur');
  return (
    <section id="investment" className="py-20 md:py-32">
      <div className="wrap">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Investment</p>
            <h2 className="mt-2.5 text-h2">Two ways to be photographed</h2>
          </div>
          <div role="group" aria-label="Currency" className="inline-flex border border-line">
            {(['eur', 'usd'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cur === c}
                onClick={() => setCur(c)}
                className={`px-4 py-3 text-xs font-medium tracking-[0.12em] ${cur === c ? 'bg-onyx text-bone' : 'text-ink'}`}
              >
                {c === 'eur' ? 'EUR €' : 'USD $'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {packages.map((p) => (
            <article
              key={p.id}
              className={`grid content-start gap-6 border p-6 md:p-11 ${p.featured ? 'border-sand bg-paper' : 'border-line bg-bone'}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terra">{p.tag}</p>
              <h3 className="text-4xl leading-tight">{p.name}</h3>
              <p className="font-serif text-5xl leading-none tabular-nums">
                {fmt(p.price[cur], cur)}
                <small className="ml-1.5 font-sans text-xs uppercase tracking-[0.1em] text-ink">
                  {cur === p.base ? 'from' : 'approx.'}
                </small>
              </p>
              <ul className="grid gap-2.5">
                {p.inclusions.map((x) => (
                  <li key={x} className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 text-sm text-ink">
                    <span aria-hidden="true" className="mt-[11px] h-px w-3 bg-terra" />
                    {x}
                  </li>
                ))}
              </ul>
              <OpenInquiry pkg={p.id} className={p.featured ? 'btn justify-self-start' : 'btn btn-ghost justify-self-start'}>
                {p.cta}
              </OpenInquiry>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-ink">
          A 30% retainer holds your date. Sahara add-on, weddings and proposal planning quoted on request.
        </p>
      </div>
    </section>
  );
}
