import Image from './Img';
import { useEffect, useRef, useState } from 'react';
import { inquiryOptions, packages, site } from '../data/content';
import { FORM_ENDPOINT, FORM_TYPE } from '../lib/site';
import { img, alt } from './img';

type Status = 'idle' | 'sending' | 'sent';

export default function InquiryDrawer({ open, pkg, onClose }: { open: boolean; pkg?: string; onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [failed, setFailed] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const pkgRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!open) return;
    if (pkg && pkgRef.current) pkgRef.current.value = pkg;
    const t = setTimeout(() => nameRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, pkg, onClose]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFailed(false);
    const fd = new FormData(e.currentTarget);
    // Clipped like the old server route did: the collector URL is public, so
    // nothing here can rely on the browser's maxLength alone.
    const get = (k: string) => String(fd.get(k) ?? '').trim().slice(0, 200);
    const missing = [
      !get('name') && 'your name',
      !get('contact') && 'a WhatsApp number or email',
      !get('country') && 'your country',
      (!get('from') || !get('to')) && 'your travel dates',
    ].filter(Boolean);
    if (missing.length) return setError(`Please add ${missing.join(', ')}.`);
    if (get('to') < get('from')) return setError('Your leaving date is before your arrival date. Please check both.');

    const pkgName = packages.find((p) => p.id === get('pkg'))?.name ?? 'Help me choose';
    setError('');
    setStatus('sending');
    setSummary(
      `Hello Wael,\n\nName: ${get('name')}\nContact: ${get('contact')}\nCountry: ${get('country')}\nIn Tunisia: ${get('from')} to ${get('to')}\nLocation: ${get('location')}\nStyle: ${get('style')}\nPackage: ${pkgName}`,
    );

    // Honeypot: real visitors never fill it in. Show success, send nothing.
    if (get('company')) return setStatus('sent');

    const payload = {
      name: get('name'),
      contact: get('contact'),
      email: get('contact').includes('@') ? get('contact') : undefined,
      country: get('country'),
      from: get('from'),
      to: get('to'),
      location: get('location'),
      style: get('style'),
      pkg: pkgName,
      formType: FORM_TYPE,
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
    } catch {
      setStatus('idle');
      setFailed(true);
      setError(
        site.whatsapp
          ? 'We could not send your inquiry. Please message Wael directly on WhatsApp instead.'
          : 'We could not send your inquiry. Please try again in a moment.',
      );
    } finally {
      clearTimeout(timer);
    }
  }

  const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(summary)}` : '';

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-onyx/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        aria-hidden={!open}
        aria-labelledby="inquiry-title"
        className={`fixed inset-y-0 right-0 z-[71] w-full max-w-[520px] overflow-y-auto bg-bone px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] transition-[transform,visibility] duration-500 sm:px-10 ${
          open ? 'visible translate-x-0' : 'invisible translate-x-[102%]'
        }`}
      >
        <button type="button" onClick={onClose} className="absolute right-5 top-[calc(18px+env(safe-area-inset-top))] text-xs uppercase tracking-[0.14em]">
          Close ✕
        </button>
        <p className="eyebrow">Reserve your shoot</p>
        <h2 id="inquiry-title" className="mb-2.5 mt-2 text-[2.4rem] leading-tight">
          Let&apos;s plan your session
        </h2>
        <p className="mb-7 text-ink">I reply within 12 hours with available times and a light plan for your dates.</p>

        {status === 'sent' ? (
          <div className="grid gap-4">
            <div className="relative aspect-[13/9] overflow-hidden bg-paper">
              <Image src={img('thank-you-light-painting')} alt={alt('thank-you-light-painting')} fill sizes="480px" className="object-cover" />
            </div>
            <h3 className="text-3xl">Inquiry sent</h3>
            <p className="text-ink">Thank you. Wael will reply within 12 hours. Prefer WhatsApp? Send the same details there:</p>
            <pre className="m-0 whitespace-pre-wrap border border-line bg-paper p-4 font-sans text-[13px]">{summary}</pre>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn justify-self-start">
                Continue on WhatsApp
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4">
            <label className="label" htmlFor="f-name">
              Full name
              <input ref={nameRef} id="f-name" name="name" autoComplete="name" maxLength={120} className="field" />
            </label>
            <label className="label" htmlFor="f-contact">
              WhatsApp or email
              <input id="f-contact" name="contact" maxLength={200} placeholder="+44 7700 900123 or you@mail.com" className="field" />
            </label>
            <label className="label" htmlFor="f-country">
              Country of residence
              <select id="f-country" name="country" className="field" defaultValue="">
                <option value="">Select</option>
                {inquiryOptions.countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <label className="label" htmlFor="f-from">
                Arriving
                <input id="f-from" name="from" type="date" className="field" />
              </label>
              <label className="label" htmlFor="f-to">
                Leaving
                <input id="f-to" name="to" type="date" className="field" />
              </label>
            </div>
            <label className="label" htmlFor="f-location">
              Preferred location
              <select id="f-location" name="location" className="field">
                {inquiryOptions.locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend className="eyebrow mb-2.5 text-ink">Shoot style</legend>
              <div className="flex flex-wrap gap-2">
                {inquiryOptions.styles.map((s, i) => (
                  <label key={s} className="inline-flex cursor-pointer text-sm">
                    <input type="radio" name="style" value={s} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="border border-line px-3 py-2 peer-checked:border-onyx peer-checked:bg-onyx peer-checked:text-bone peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-terra">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="label" htmlFor="f-pkg">
              Package
              <select ref={pkgRef} id="f-pkg" name="pkg" className="field" defaultValue="coastal">
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="unsure">Help me choose</option>
              </select>
            </label>
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            {error && (
              <p role="alert" className="text-[13px] text-[#9A4A33]">
                {error}
              </p>
            )}
            {failed && waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost justify-self-start">
                Message on WhatsApp
              </a>
            )}
            <button type="submit" className="btn justify-self-start" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send inquiry'}
            </button>
          </form>
        )}
      </aside>
    </>
  );
}
