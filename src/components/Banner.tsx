import Image from './Img';
import { img } from './img';

export default function Banner() {
  return (
    <section aria-label="Approach" className="relative overflow-hidden bg-night text-bone">
      <Image src={img('leaf-panorama')} alt="" fill sizes="100vw" className="object-cover object-right" />
      <div className="wrap relative py-20 md:py-36">
        <blockquote className="max-w-[20ch] font-serif text-[clamp(2rem,4.2vw,3.4rem)] italic leading-tight">
          Light first. Then you.
        </blockquote>
        <p className="mt-5 max-w-[40ch] text-bone/75">
          Every session is planned around the hour the light is kindest, so your images feel calm, warm and quietly
          cinematic.
        </p>
      </div>
    </section>
  );
}
