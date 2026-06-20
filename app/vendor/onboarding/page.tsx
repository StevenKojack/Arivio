import { Footer } from "../../components/Footer";
import { Navigation } from "../../components/Navigation";
import { VendorOnboardingForm } from "./VendorOnboardingForm";

export default function VendorOnboardingPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Vendor onboarding
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Create your first provider listing.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Add your business profile and one starter service. Admin approval
            and richer service management come next.
          </p>
        </div>
        <VendorOnboardingForm />
      </section>
      <Footer />
    </main>
  );
}
