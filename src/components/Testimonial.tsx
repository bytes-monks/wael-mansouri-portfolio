import Image from './Img';
import { testimonial } from '../data/content';
import { img } from './img';

export default function Testimonial() {
  return (
    <section aria-label="Client feedback" className="relative bg-[#2c3442] text-bone">
      <Image src={img('sea-reflection')} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-onyx/40" />
      <div className="wrap relative py-20 md:py-32">
        <figure>
          <blockquote className="mx-auto max-w-[30ch] text-center font-serif text-[clamp(1.7rem,3.4vw,2.7rem)] italic leading-tight">
            “{testimonial.quote}”
          </blockquote>
          <figcaption className="mt-6 text-center text-[11px] font-medium uppercase tracking-label text-sand">
            {testimonial.cite}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
