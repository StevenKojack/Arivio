import { Suspense } from "react";
import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";
import { EventWizard } from "./EventWizard";

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <Suspense fallback={<DiscoveryLoading />}>
        <EventWizard />
      </Suspense>
      <Footer />
    </main>
  );
}

function DiscoveryLoading() {
  return (
    <section className="px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-lg border border-neutral-200 bg-white p-8 text-sm font-semibold text-neutral-500">
        Loading event discovery...
      </div>
    </section>
  );
}
