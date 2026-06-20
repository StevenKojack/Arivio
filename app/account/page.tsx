import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";

const plannerFeatures = [
  "Save events and shortlists",
  "Track budgets and guest counts",
  "Message venues and vendors",
];

const providerFeatures = [
  "Create a marketplace listing",
  "Manage availability and pricing",
  "Receive qualified event leads",
];

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <Navigation />
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Accounts
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            One account for planners and event businesses.
          </h1>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <AccountPanel
              title="Plan an event"
              body="Create a planner account to save your event details and keep every option organized."
              features={plannerFeatures}
              cta="Create planner account"
            />
            <AccountPanel
              title="List your services"
              body="Create a provider account to get discovered by people planning high-intent events."
              features={providerFeatures}
              cta="Create provider account"
              dark
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

type AccountPanelProps = {
  title: string;
  body: string;
  features: string[];
  cta: string;
  dark?: boolean;
};

function AccountPanel({ title, body, features, cta, dark }: AccountPanelProps) {
  return (
    <article
      className={`rounded-lg p-6 shadow-[0_22px_60px_rgba(20,20,20,0.07)] ${
        dark ? "bg-neutral-950 text-white" : "border border-neutral-200 bg-white"
      }`}
    >
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className={`mt-4 leading-7 ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
        {body}
      </p>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                dark ? "bg-[#ff8b8f]" : "bg-[#ff5a5f]"
              }`}
            />
            {feature}
          </li>
        ))}
      </ul>
      <form className="mt-8 grid gap-3">
        <input
          type="email"
          placeholder="Email address"
          className={`h-12 rounded-lg border px-4 text-sm font-medium outline-none transition focus:border-[#ff5a5f] ${
            dark
              ? "border-white/15 bg-white/10 text-white placeholder:text-neutral-400"
              : "border-neutral-300 bg-white text-neutral-950"
          }`}
        />
        <button
          type="button"
          className={`h-12 rounded-full px-6 text-sm font-semibold transition ${
            dark
              ? "bg-white text-neutral-950 hover:bg-neutral-100"
              : "bg-[#ff5a5f] text-white hover:bg-[#e84f54]"
          }`}
        >
          {cta}
        </button>
      </form>
    </article>
  );
}
