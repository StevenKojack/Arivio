import { Footer } from "@/app/components/Footer";
import { Navigation } from "@/app/components/Navigation";
import { AdminDashboard } from "./AdminDashboard";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <AdminDashboard />
      </section>
      <Footer />
    </main>
  );
}
