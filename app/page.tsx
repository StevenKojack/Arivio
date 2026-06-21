import Link from "next/link";
import { CategorySection } from "./components/CategorySection";
import { Footer } from "./components/Footer";
import { EventDiscoverySearch } from "./components/EventDiscoverySearch";
import { HowItWorks } from "./components/HowItWorks";
import { MarketplacePreview } from "./components/MarketplacePreview";
import { Navigation } from "./components/Navigation";
import { TrustSection } from "./components/TrustSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="relative overflow-hidden px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,90,95,0.16),transparent_58%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-220px)] max-w-7xl flex-col items-center justify-center text-center">
          <p className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-600 shadow-[0_12px_30px_rgba(20,20,20,0.05)] backdrop-blur">
            Arivio event discovery
          </p>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight text-neutral-950 sm:text-7xl lg:text-8xl">
            What are you planning?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
            Describe the event in your own words. Arivio turns it into a
            planning profile, smart questions, and the right vendor stack.
          </p>
          <div className="mt-10 w-full animate-[fadeUp_360ms_ease-out]">
            <EventDiscoverySearch />
          </div>
        </div>
      </section>
      <HowItWorks />
      <CategorySection />
      <MarketplacePreview />
      <TrustSection />
      <section className="bg-white px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg border border-neutral-200 bg-[#f7f7f5] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
              Providers
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Bring your service into the Arivio network.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-neutral-600">
              Venues, caterers, entertainers, rental teams, florists, and event
              specialists can receive clearer quote requests from real plans.
            </p>
          </div>
          <Link
            href="/vendor/onboarding"
            className="inline-flex h-12 w-fit items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            List your service
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
