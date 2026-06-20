const steps = [
  {
    title: "Tell Arivio the occasion",
    body: "Share the event type, location, guest count, budget, and the services you need.",
  },
  {
    title: "Compare matched options",
    body: "Browse venues, vendors, entertainment, rentals, and invitations in one view.",
  },
  {
    title: "Coordinate the plan",
    body: "Keep the shortlist, budget, and next steps organized from first idea to event day.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#f7f7f5] px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            From idea to booked, without losing the thread.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-neutral-200 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-8 text-xl font-semibold text-neutral-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
