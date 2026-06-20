import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Marketplace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Browse the pieces that make an event happen.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Compare venues, vendors, entertainment, rentals, and invitations in
            one organized marketplace.
          </p>
          <div className="mt-10">
            <MarketplaceBrowser />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
