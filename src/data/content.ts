import { SITE_URL, WHATSAPP } from '../lib/site';

export const site = {
  name: 'Wael Mansouri',
  url: SITE_URL,
  whatsapp: WHATSAPP,
  title: 'Wael Mansouri | Vacation, Honeymoon & Couple Photographer in Tunisia',
  description:
    'Editorial vacation, honeymoon and couple photography across Tunisia: Sidi Bou Said, Carthage, Sousse, El Jem, Djerba and the Sahara. Location planning for travellers and 48-hour sneak peeks.',
  regions: ['Sidi Bou Said', 'Carthage', 'Sousse', 'El Jem', 'Djerba', 'Sahara'],
};

export const nav = [
  { href: '#stories', label: 'Stories' },
  { href: '#experience', label: 'The Experience' },
  { href: '#destinations', label: 'Destinations' },
  { href: '#investment', label: 'Investment' },
];

export const destinations = [
  {
    name: 'Sidi Bou Said',
    image: 'sidi-bou-said-marina',
    focus: '38% 50%',
    meta: '20 min from Tunis-Carthage airport',
    body: 'White lime walls, cobalt doors and a clifftop view over the marina and the Gulf of Tunis. Our most requested sunset location.',
    light: '17:30 – 19:00',
  },
  {
    name: 'El Jem',
    image: 'el-jem-arch-hands',
    focus: '50% 50%',
    meta: 'UNESCO World Heritage site',
    body: 'One of the best-preserved Roman amphitheatres in the world. Honey-coloured arches, long corridors and endless frames.',
    light: '08:00 – 10:00',
  },
  {
    name: 'Djerba',
    image: 'djerba-blue-lane',
    focus: '40% 50%',
    meta: 'Island of the sun',
    body: 'Blue shutters, artisan weavers and the open-air street-art gallery of Djerbahood. Bright, playful and full of colour.',
    light: 'Morning & late afternoon',
  },
  {
    name: 'The Sahara',
    image: 'sahara-dune-traveller',
    focus: '30% 50%',
    meta: 'Overnight trip · Oct – Apr',
    body: 'Golden dune ridges, palm oases and silence. Built into the Full-Day Destination Story for travellers heading south.',
    light: 'Last 45 min of sun',
  },
];

export const moreLocations = [
  { image: 'zriba-el-olia', title: 'Zriba el Olia', body: 'An abandoned Berber hill village of stone lanes and domes, clinging to the rock.', wide: true },
  { image: 'olive-country-couple', title: 'Olive country', body: 'Endless groves for wide, quiet frames.' },
  { image: 'djerba-gallery-stairs', title: "Djerba's galleries", body: 'Colour for the bold.' },
];

export const steps = [
  {
    title: 'Pre-trip planning & location advice',
    body: 'Send your dates and hotel. I build a short plan around sunset times, crowds and travel time, plus outfit notes that work with each backdrop.',
    when: 'Before you fly',
  },
  {
    title: 'The shoot',
    body: 'Relaxed, natural direction with no stiff posing. I find the light, give you something simple to do, and photograph what happens between the cues.',
    when: '1 hour to a full day',
  },
  {
    title: 'Sneak peeks in 48 hours',
    body: "Fifteen edited favourites, sized for your phone, so you can share them while you're still in Tunisia. The full high-resolution gallery follows within three weeks.",
    when: 'Before you leave',
  },
];

export type Currency = 'eur' | 'usd';

// Each package has one set price (marked `base`); the other currency is an approximate conversion.
export const packages = [
  {
    id: 'coastal',
    tag: 'Most booked',
    name: 'The Coastal Session',
    price: { eur: 300, usd: 350 },
    base: 'eur' as Currency,
    featured: false,
    inclusions: [
      '1–2 hours at one iconic location',
      'Pre-trip location and outfit guidance',
      '15 sneak peeks within 48 hours',
      '60+ edited high-resolution images',
      'Private online gallery with download',
    ],
    cta: 'Reserve this session',
  },
  {
    id: 'fullday',
    tag: 'Signature',
    name: 'The Full-Day Destination Story',
    price: { eur: 1290, usd: 1500 },
    base: 'usd' as Currency,
    featured: true,
    inclusions: [
      'Up to 8 hours across 2–3 locations',
      'Wardrobe styling assistance and shot plan',
      'Private driver between locations',
      '60–90 second cinematic reel',
      '25 sneak peeks within 48 hours',
      '200+ edited high-resolution images',
    ],
    cta: 'Reserve this story',
  },
];

export const testimonial = {
  quote: 'Went through them photos, absolutely love them. Brea is well happy!',
  cite: 'Client message after their session',
};

export const inquiryOptions = {
  countries: ['United Kingdom', 'France', 'Germany', 'United States', 'United Arab Emirates', 'Italy', 'Canada', 'Other'],
  locations: ['Sidi Bou Said', 'Carthage', 'Sousse & Port El Kantaoui', 'El Jem', 'Djerba', 'The Sahara', 'Not sure yet, advise me'],
  styles: ['Couple / Honeymoon', 'Engagement / Proposal', 'Maternity', 'Solo editorial'],
};
