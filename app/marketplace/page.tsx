import { Suspense } from "react";
import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";
import { MarketplaceBrowser } from "./MarketplaceBrowser";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] text-neutral-950">
      <Navigation />
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-6 rounded-[34px] border border-white/70 bg-white/75 p-6 shadow-[0_22px_70px_rgba(20,20,20,0.07)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
              Marketplace
            </p>
            <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
                  Build the event around the map.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
                  See venues and providers spatially, then build a quote cart from the
                  vendors that make logistical sense.
                </p>
              </div>
              <p className="max-w-sm rounded-3xl bg-[#f7f2ee] px-5 py-4 text-sm leading-6 text-neutral-700">
                Pins follow the row you are browsing, while carted vendors stay visible
                so the plan never disappears.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Suspense fallback={<MarketplaceLoading />}>
              <MarketplaceBrowser />
            </Suspense>
          </div>
        </div>
      </section>
      <Footer />
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
