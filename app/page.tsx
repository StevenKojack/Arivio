import { CategorySection } from "./components/CategorySection";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { MarketplacePreview } from "./components/MarketplacePreview";
import { Navigation } from "./components/Navigation";
import { TrustSection } from "./components/TrustSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <Navigation />
      <Hero />
      <HowItWorks />
      <CategorySection />
      <MarketplacePreview />
      <TrustSection />
      <Footer />
    </main>
  );
}
