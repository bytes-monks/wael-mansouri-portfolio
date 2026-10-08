import Header from './components/Header';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Stories from './components/Stories';
import Banner from './components/Banner';
import Destinations from './components/Destinations';
import Experience from './components/Experience';
import Testimonial from './components/Testimonial';
import Investment from './components/Investment';
import Closing from './components/Closing';
import Footer from './components/Footer';
import { InquiryProvider } from './components/InquiryProvider';
import { jsonLd } from './lib/seo';

// `<` is escaped so no string in the data can close the script element early.
const ld = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

export default function App() {
  return (
    <InquiryProvider>
      <Header />
      <main id="top">
        <Hero />
        <Intro />
        <Stories />
        <Banner />
        <Destinations />
        <Experience />
        <Testimonial />
        <Investment />
        <Closing />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
    </InquiryProvider>
  );
}
