import { Suspense } from "react";
import { Navigation } from "../components/Navigation";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] text-neutral-950">
      <Navigation />
      <section className="w-full px-3 pb-4 pt-3 sm:px-4">
        <Suspense fallback={<MarketplaceLoading />}>
          <MarketplaceBrowser />
        </Suspense>
      </section>
    </main>
  );
}

function MarketplaceLoading() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-8 text-sm font-semibold text-neutral-500">
      Loading marketplace...
    </div>
  );
}
