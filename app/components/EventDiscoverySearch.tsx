"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { eventExamples } from "@/lib/event-intelligence/taxonomy";
import { searchEventIntents } from "@/lib/event-intelligence/search";

export function EventDiscoverySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => searchEventIntents(query, 6), [query]);
  const placeholder = eventExamples[0];

  function submitSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim() || placeholder;
    const params = new URLSearchParams({ query: cleanQuery });

    router.push(`/discover?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
        className="relative"
      >
        <div className="flex min-h-[72px] items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-[0_24px_80px_rgba(20,20,20,0.12)] transition focus-within:border-neutral-950 focus-within:shadow-[0_28px_90px_rgba(20,20,20,0.16)] sm:px-5">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-lg font-semibold text-[#e24b44] sm:flex">
            A
          </div>
          <input
            value={query}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            className="h-12 min-w-0 flex-1 bg-transparent text-lg font-semibold text-neutral-950 outline-none placeholder:text-neutral-400 sm:text-xl"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(20,20,20,0.18)] transition hover:-translate-y-0.5 hover:bg-neutral-800 sm:px-7"
          >
            Start
          </button>
        </div>

        {focused ? (
          <div className="absolute left-0 right-0 top-[84px] z-20 overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_28px_90px_rgba(20,20,20,0.16)]">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.label}-${suggestion.recognition.profile.id}`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submitSearch(suggestion.label)}
                className="flex w-full items-center justify-between gap-4 rounded-[22px] px-4 py-3 text-left transition hover:bg-neutral-50"
              >
                <span>
                  <span className="block text-sm font-semibold text-neutral-950">
                    {suggestion.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-neutral-500">
                    {suggestion.recognition.profile.venueStyle}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-[#c33d38]">
                  {suggestion.recognition.profile.primaryType}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </form>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {eventExamples.slice(1, 7).map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => submitSearch(example)}
            className="rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-700 backdrop-blur transition hover:border-neutral-950 hover:text-neutral-950"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
