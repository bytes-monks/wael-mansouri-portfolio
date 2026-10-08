import { site, packages } from '../data/content';

export const keywords = [
  'Tunisia photographer',
  'vacation photographer Tunisia',
  'honeymoon photographer Tunisia',
  'couple photoshoot Sidi Bou Said',
  'El Jem photoshoot',
  'Djerba photographer',
  'Sousse photographer',
  'maternity photoshoot Tunisia',
  'Carthage photoshoot',
];

export const ogImage = {
  path: '/og.jpg',
  width: 1200,
  height: 630,
  alt: 'Couple touching foreheads in the El Jem amphitheatre, Tunisia',
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Wael Mansouri Photography',
  description: site.description,
  url: `${site.url}/`,
  image: `${site.url}${ogImage.path}`,
  areaServed: site.regions.map((name) => ({ '@type': 'Place', name: `${name}, Tunisia` })),
  address: { '@type': 'PostalAddress', addressCountry: 'TN' },
  knowsLanguage: ['en', 'fr', 'ar'],
  priceRange: '€300 – $1,500',
  makesOffer: packages.map((p) => ({
    '@type': 'Offer',
    name: p.name,
    price: p.price[p.base],
    priceCurrency: p.base.toUpperCase(),
  })),
};
