import { CategorySection } from "./components/CategorySection";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navigation } from "./components/Navigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <Navigation />
      <Hero />
      <CategorySection />
      <Footer />
    </main>
  );
}
