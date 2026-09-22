import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Faq from '@/components/Faq';
import Closing from '@/components/Closing';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <HowItWorks />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
