"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { allServices, eventTypes } from "../../data/marketplace";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { ensureCurrentProfile } from "@/lib/supabase/profiles";
import type { PricingType } from "@/lib/types/domain";

export function VendorOnboardingForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DJ");
  const [city, setCity] = useState("Los Angeles");
  const [radius, setRadius] = useState(30);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceName, setServiceName] = useState("DJ package");
  const [pricingType, setPricingType] = useState<PricingType>("hourly");
  const [basePrice, setBasePrice] = useState(300);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [minimumHours, setMinimumHours] = useState(3);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([
    "Birthday",
    "Wedding",
    "Private Party",
  ]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleEventType(eventType: string) {
    setSelectedEventTypes((current) =>
      current.includes(eventType)
        ? current.filter((item) => item !== eventType)
        : [...current, eventType],
    );
  }

  async function submitVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasSupabaseConfig()) {
      setError("Supabase is not configured yet. Add .env.local values first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const profile = await ensureCurrentProfile(supabase, user, "vendor");
      const { data: vendor, error: vendorError } = await supabase
        .from("vendor_businesses")
        .insert({
          business_name: businessName,
          category,
          description: description || null,
          approval_status: "approved",
          owner_id: profile.id,
          phone: phone || null,
          service_area_city: city,
          service_radius_miles: radius,
          website_url: websiteUrl || null,
        })
        .select("id")
        .single();

      if (vendorError) {
        throw vendorError;
      }

      const { error: serviceError } = await supabase.from("vendor_services").insert({
        base_price: pricingType === "hourly" ? null : basePrice,
        category,
        description: description || null,
        event_types_supported: selectedEventTypes,
        hourly_rate: pricingType === "hourly" ? hourlyRate : null,
        minimum_hours: pricingType === "hourly" ? minimumHours : null,
        pricing_type: pricingType,
        service_name: serviceName,
        vendor_id: vendor.id,
      });

      if (serviceError) {
        throw serviceError;
      }

      router.push("/account");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create vendor listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitVendor}
      className="mx-auto mt-10 grid max-w-4xl gap-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_22px_60px_rgba(20,20,20,0.07)]"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Business name
          <input
            required
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Category
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setServiceName(`${event.target.value} package`);
            }}
            className="h-12 rounded-lg border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-950"
          >
            {allServices.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800 md:col-span-2">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Service city
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Service radius
          <input
            type="number"
            min="1"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Website
          <input
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://"
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Phone
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
          />
        </label>
      </div>

      <div className="rounded-lg bg-[#f7f7f5] p-5">
        <h2 className="text-xl font-semibold tracking-tight">Starter service</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Service name
            <input
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Pricing type
            <select
              value={pricingType}
              onChange={(event) => setPricingType(event.target.value as PricingType)}
              className="h-12 rounded-lg border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-950"
            >
              <option value="hourly">Hourly</option>
              <option value="flat">Flat</option>
              <option value="per_guest">Per guest</option>
            </select>
          </label>
          {pricingType === "hourly" ? (
            <>
              <label className="grid gap-2 text-sm font-semibold text-neutral-800">
                Hourly rate
                <input
                  type="number"
                  min="0"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(Number(event.target.value))}
                  className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-neutral-800">
                Minimum hours
                <input
                  type="number"
                  min="1"
                  value={minimumHours}
                  onChange={(event) => setMinimumHours(Number(event.target.value))}
                  className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
                />
              </label>
            </>
          ) : (
            <label className="grid gap-2 text-sm font-semibold text-neutral-800">
              {pricingType === "per_guest" ? "Price per guest" : "Base price"}
              <input
                  type="number"
                min="0"
                value={basePrice}
                onChange={(event) => setBasePrice(Number(event.target.value))}
                className="h-12 rounded-lg border border-neutral-300 px-4 text-sm outline-none focus:border-neutral-950"
              />
            </label>
          )}
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-neutral-800">
            Event types supported
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {eventTypes.map((eventType) => (
              <button
                key={eventType}
                type="button"
                onClick={() => toggleEventType(eventType)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  selectedEventTypes.includes(eventType)
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700"
                }`}
              >
                {eventType}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button
        disabled={isSubmitting}
        className="h-12 rounded-full bg-[#ff5a5f] px-6 text-sm font-semibold text-white transition hover:bg-[#e84f54] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create vendor listing"}
      </button>
    </form>
  );
}
