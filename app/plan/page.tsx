import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";
import { PlannerForm } from "./PlannerForm";

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Start planning
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Build the first version of your event plan.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Capture the essentials and Arivio will organize the right categories,
            budget signals, and marketplace matches around your event.
          </p>
          <div className="mt-10">
            <PlannerForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
