import Image from './Img';
import OpenInquiry from './OpenInquiry';
import { img } from './img';

export default function Closing() {
  return (
    <section className="relative bg-[#3a2a22] text-center text-bone">
      <Image src={img('sunset-rooftops')} alt="" fill sizes="100vw" className="object-cover object-[50%_60%]" />
      <div className="absolute inset-0 bg-gradient-to-b from-onyx/15 to-onyx/50" />
      <div className="wrap relative grid justify-items-center gap-6 py-28 md:py-44">
        <p className="eyebrow text-sand">Limited sessions each month</p>
        <h2 className="max-w-[20ch] text-h2">Tell me your dates and I&apos;ll plan the light.</h2>
        <OpenInquiry className="btn btn-light">Reserve your shoot</OpenInquiry>
      </div>
    </section>
  );
}
