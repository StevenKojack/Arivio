import { Footer } from "./components/Footer";
import { EventDiscoverySearch } from "./components/EventDiscoverySearch";
import { Navigation } from "./components/Navigation";

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
      <Footer />
    </main>
  );
}
