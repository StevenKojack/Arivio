"use client";

import type { ServiceName } from "@/app/data/marketplace";

type ServiceRecommendationCardProps = {
  isSelected: boolean;
  onToggle: (service: ServiceName) => void;
  service: ServiceName;
};

export function ServiceRecommendationCard({
  isSelected,
  onToggle,
  service,
}: ServiceRecommendationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(service)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-neutral-950 bg-white text-neutral-950 shadow-[0_12px_30px_rgba(20,20,20,0.06)]"
          : "border-neutral-200 bg-[#fbfbfa] text-neutral-500 hover:border-neutral-400"
      }`}
    >
      <span className="text-sm font-semibold">{service}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
          isSelected ? "bg-neutral-950 text-white" : "bg-white text-neutral-400"
        }`}
      >
        {isSelected ? "-" : "+"}
      </span>
    </button>
  );
}
