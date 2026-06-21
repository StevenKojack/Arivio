"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getHoursBetween,
  homeAreas,
  marketplaceItems,
  quoteItem,
  type MarketplaceItem,
} from "../data/marketplace";
import { getDynamicQuestions } from "@/lib/event-intelligence/questions";
import {
  groupRankedItems,
  rankMarketplaceItems,
  type RankedMarketplaceItem,
} from "@/lib/event-intelligence/recommendations";
import {
  recognizeEventIntent,
  searchEventIntents,
} from "@/lib/event-intelligence/search";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { getMarketplaceProviders } from "@/lib/repositories/marketplaceRepository";

type AnswerMap = Record<string, string | number | boolean>;

function demoItems() {
  return marketplaceItems.map((item) => ({ ...item, databaseSource: false }));
}

export function EventWizard() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "Birthday party";
  const [query, setQuery] = useState(initialQuery);
  const [providers, setProviders] = useState<MarketplaceItem[]>(demoItems);
  const [providerMessage, setProviderMessage] = useState("Loading provider matches...");
  const [timing, setTiming] = useState({
    date: "",
    endTime: "22:00",
    setupTime: "16:00",
    startTime: "18:00",
    teardownTime: "23:00",
    timezone: "America/Los_Angeles",
  });
  const [answers, setAnswers] = useState<AnswerMap>({
    budgetTier: "Standard",
    guestCount: 60,
    venueStyle: "",
  });
  const recognition = useMemo(() => recognizeEventIntent(query), [query]);
  const questions = useMemo(
    () => getDynamicQuestions(recognition.profile),
    [recognition.profile],
  );
  const suggestions = useMemo(() => searchEventIntents(query, 5), [query]);
  const guestCount = Number(answers.guestCount || 60);
  const quoteContext = useMemo(
    () => ({
      date: timing.date,
      durationHours: getHoursBetween(timing.startTime, timing.endTime),
      endTime: timing.endTime,
      guests: Number.isFinite(guestCount) ? guestCount : 60,
      startTime: timing.startTime,
    }),
    [guestCount, timing.date, timing.endTime, timing.startTime],
  );
  const rankedItems = useMemo(
    () =>
      rankMarketplaceItems(providers, recognition, {
        coordinates: homeAreas[0].coordinates,
        quoteContext,
      }),
    [providers, recognition, quoteContext],
  );
  const groupedItems = groupRankedItems(rankedItems);
  const marketplaceHref = useMemo(() => {
    const profile = recognition.profile;
    const params = new URLSearchParams({
      budget: budgetEstimateFromTier(String(answers.budgetTier ?? profile.budgetTier)),
      date: timing.date,
      duration: String(quoteContext.durationHours),
      event: profile.marketplaceEventType ?? "Private Party",
      guests: String(quoteContext.guests),
      services: [
        ...profile.requiredVendors,
        ...profile.recommendedVendors,
      ].join(","),
      time: timing.startTime,
    });

    return `/marketplace?${params.toString()}`;
  }, [answers.budgetTier, quoteContext, recognition.profile, timing.date, timing.startTime]);

  useEffect(() => {
    async function loadProviders() {
      if (!hasSupabaseConfig()) {
        setProviders(demoItems());
        setProviderMessage("Showing demo providers until Supabase has approved vendors.");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const databaseProviders = await getMarketplaceProviders(supabase);

        if (databaseProviders.length) {
          setProviders(databaseProviders);
          setProviderMessage("Showing approved database providers ranked by event fit.");
          return;
        }

        setProviders(demoItems());
        setProviderMessage("No approved database providers found yet. Showing demo providers.");
      } catch (error) {
        setProviders(demoItems());
        setProviderMessage(
          error instanceof Error
            ? `${error.message}. Showing demo providers.`
            : "Unable to load database providers. Showing demo providers.",
        );
      }
    }

    loadProviders();
  }, []);

  function setAnswer(id: string, value: string | number | boolean) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  return (
    <section className="px-6 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[0.86fr_1.14fr]">
        <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_24px_70px_rgba(20,20,20,0.08)] xl:sticky xl:top-24">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e24b44]">
            Event discovery
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            {recognition.profile.primaryType}
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            {recognition.profile.description}
          </p>

          <label className="mt-6 block text-sm font-semibold text-neutral-800">
            What are you planning?
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
            />
          </label>

          <div className="mt-3 grid gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.label}-${suggestion.recognition.profile.id}`}
                type="button"
                onClick={() => setQuery(suggestion.label)}
                className="rounded-lg border border-neutral-200 bg-[#fbfbfa] px-3 py-2 text-left text-xs font-semibold text-neutral-700 transition hover:border-neutral-950"
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-lg bg-neutral-950 p-4 text-white">
            <ProfileMetric label="Primary type" value={recognition.profile.primaryType} />
            <ProfileMetric
              label="Subtype"
              value={recognition.preservedSubtype ?? recognition.profile.subtype ?? "General"}
            />
            <ProfileMetric label="Venue style" value={recognition.profile.venueStyle} />
            <ProfileMetric label="Budget tier" value={recognition.profile.budgetTier} />
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(20,20,20,0.05)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e24b44]">
                  Date and time
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Lock the operating window first.
                </h2>
              </div>
              <p className="text-sm font-semibold text-neutral-500">
                {quoteContext.durationHours} hour event
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <TimingField
                label="Date"
                type="date"
                value={timing.date}
                onChange={(value) => setTiming((current) => ({ ...current, date: value }))}
              />
              <TimingField
                label="Start time"
                type="time"
                value={timing.startTime}
                onChange={(value) =>
                  setTiming((current) => ({ ...current, startTime: value }))
                }
              />
              <TimingField
                label="End time"
                type="time"
                value={timing.endTime}
                onChange={(value) => setTiming((current) => ({ ...current, endTime: value }))}
              />
              <TimingField
                label="Timezone"
                type="text"
                value={timing.timezone}
                onChange={(value) =>
                  setTiming((current) => ({ ...current, timezone: value }))
                }
              />
              <TimingField
                label="Setup time"
                type="time"
                value={timing.setupTime}
                onChange={(value) =>
                  setTiming((current) => ({ ...current, setupTime: value }))
                }
              />
              <TimingField
                label="Teardown time"
                type="time"
                value={timing.teardownTime}
                onChange={(value) =>
                  setTiming((current) => ({ ...current, teardownTime: value }))
                }
              />
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(20,20,20,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e24b44]">
              Smart questions
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Only the details this event needs.
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {questions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => setAnswer(question.id, value)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_50px_rgba(20,20,20,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e24b44]">
                  Recommendation engine
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Vendor stack ranked by fit.
                </h2>
                <p className="mt-2 text-sm text-neutral-600">{providerMessage}</p>
              </div>
              <Link
                href={marketplaceHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                Open marketplace
              </Link>
            </div>

            <div className="mt-6 grid gap-5">
              <RecommendationGroup
                title="Required vendors"
                description="The event likely needs these to function."
                items={groupedItems.required}
                quoteContext={quoteContext}
              />
              <RecommendationGroup
                title="Recommended vendors"
                description="Strong fit for guest experience and event flow."
                items={groupedItems.recommended}
                quoteContext={quoteContext}
              />
              <RecommendationGroup
                title="Optional vendors"
                description="Useful depending on taste, location, and program."
                items={groupedItems.optional}
                quoteContext={quoteContext}
              />
              <RecommendationGroup
                title="Luxury add-ons"
                description="Elevated touches when the budget allows."
                items={groupedItems.luxury}
                quoteContext={quoteContext}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}

function TimingField({
  label,
  onChange,
  type,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type: string;
  value: string;
}) {
  return (
    <label className="text-sm font-semibold text-neutral-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function QuestionField({
  onChange,
  question,
  value,
}: {
  onChange: (value: string | number | boolean) => void;
  question: ReturnType<typeof getDynamicQuestions>[number];
  value?: string | number | boolean;
}) {
  if (question.type === "boolean") {
    return (
      <label className="flex min-h-12 items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800">
        {question.label}
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 accent-[#ff5a5f]"
        />
      </label>
    );
  }

  if (question.type === "select") {
    return (
      <label className="text-sm font-semibold text-neutral-800">
        {question.label}
        <select
          value={String(value ?? question.options?.[0] ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
        >
          {question.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="text-sm font-semibold text-neutral-800">
      {question.label}
      <input
        type={question.type}
        value={String(value ?? "")}
        onChange={(event) =>
          onChange(question.type === "number" ? Number(event.target.value) : event.target.value)
        }
        placeholder={question.placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function RecommendationGroup({
  description,
  items,
  quoteContext,
  title,
}: {
  description: string;
  items: RankedMarketplaceItem[];
  quoteContext: Parameters<typeof quoteItem>[1];
  title: string;
}) {
  const visibleItems = items.slice(0, 4);

  return (
    <div className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
            {title}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
          {items.length}
        </span>
      </div>

      {visibleItems.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {visibleItems.map(({ item, match }) => (
            <article
              key={`${title}-${item.id}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_rgba(20,20,20,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e24b44]">
                    {item.type}
                  </p>
                  <h4 className="mt-2 text-base font-semibold text-neutral-950">
                    {item.name}
                  </h4>
                </div>
                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                  {match.score}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-neutral-500">
                {item.location}
              </p>
              <p className="mt-3 text-sm text-neutral-600">
                {match.reasons.slice(0, 2).join(". ")}
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="text-lg font-semibold text-neutral-950">
                  ${quoteItem(item, quoteContext).toLocaleString()}
                </p>
                {!item.databaseSource ? (
                  <span className="rounded-full bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-[#c33d38]">
                    Demo
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Database
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm font-semibold text-neutral-500">
          No providers in this group yet.
        </p>
      )}
    </div>
  );
}

function budgetEstimateFromTier(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("luxury")) {
    return "25000";
  }

  if (normalized.includes("premium")) {
    return "15000";
  }

  if (normalized.includes("economy")) {
    return "2500";
  }

  return "6000";
}
