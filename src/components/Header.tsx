import { useEffect, useState } from 'react';
import { nav } from '../data/content';
import OpenInquiry from './OpenInquiry';

export default function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-colors ${
        solid ? 'border-line bg-bone/95 backdrop-blur' : 'border-transparent'
      }`}
    >
      <div className="wrap flex h-[76px] items-center justify-between gap-5">
        <a href="#top" className="whitespace-nowrap font-serif text-[1.6rem] no-underline">
          Wael <i className="text-terra">Mansouri</i>
        </a>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-8">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-xs uppercase tracking-[0.14em] hover:text-terra">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <OpenInquiry className="btn px-4 py-3">
          <span className="hidden sm:inline">Reserve your shoot</span>
          <span aria-hidden="true">→</span>
          <span className="sr-only sm:hidden">Reserve your shoot</span>
        </OpenInquiry>
      </div>
    </header>
  );
}
