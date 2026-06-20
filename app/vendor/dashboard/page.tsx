import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";
import { VendorDashboard } from "./VendorDashboard";

export default function VendorDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <VendorDashboard />
      </section>
      <Footer />
    </main>
  );
}
