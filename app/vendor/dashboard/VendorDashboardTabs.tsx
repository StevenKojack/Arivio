"use client";

import { useMemo, useState } from "react";
import { allServices } from "@/app/data/marketplace";
import type { BookingRow } from "@/lib/repositories/bookingsRepository";
import type { QuoteRequestRow } from "@/lib/repositories/quotesRepository";
import type {
  VendorAvailabilityRow,
  VendorBusinessRow,
  VendorPhotoRow,
  VendorServiceRow,
} from "@/lib/repositories/vendorsRepository";
import type { PublicTableRow } from "@/lib/supabase/database.types";
import type { PricingType, QuoteStatus } from "@/lib/types/domain";
import { formatDate, formatMoney, formatTime } from "@/lib/utils/format";

export type QuoteWithEvent = QuoteRequestRow & {
  event?: PublicTableRow<"events">;
};

export type VendorDashboardTab =
  | "Dashboard"
  | "Services"
  | "Availability"
  | "Photos"
  | "Quotes"
  | "Bookings"
  | "Profile"
  | "Business Settings"
  | "Analytics";

export const vendorDashboardTabs: VendorDashboardTab[] = [
  "Dashboard",
  "Services",
  "Availability",
  "Photos",
  "Quotes",
  "Bookings",
  "Profile",
  "Business Settings",
  "Analytics",
];

export type ServiceDraft = {
  basePrice: number;
  category: string;
  hourlyRate: number;
  minimumHours: number;
  pricingType: PricingType;
  serviceName: string;
};

export type AvailabilityDraft = {
  date: string;
  endTime: string;
  startTime: string;
  status: "available" | "blocked" | "tentative";
  vendorId: string;
};

export type BusinessDraft = {
  businessName: string;
  category: string;
  city: string;
  description: string;
  phone: string;
  radius: number;
  websiteUrl: string;
};

type VendorTabProps = {
  availability: VendorAvailabilityRow[];
  bookings: BookingRow[];
  message?: string;
  onCreateAvailability: (draft: AvailabilityDraft) => Promise<void>;
  onCreateService: (draft: ServiceDraft) => Promise<void>;
  onRespondQuote: (
    quoteId: string,
    status: Extract<QuoteStatus, "accepted" | "declined" | "countered">,
    vendorFinalPrice?: number | null,
  ) => Promise<void>;
  onToggleService: (service: VendorServiceRow) => Promise<void>;
  onUpdateBusiness: (vendorId: string, draft: BusinessDraft) => Promise<void>;
  photos: VendorPhotoRow[];
  quotes: QuoteWithEvent[];
  services: VendorServiceRow[];
  vendors: VendorBusinessRow[];
};

export function DashboardTab({
  bookings,
  quotes,
  services,
  vendors,
}: Pick<VendorTabProps, "bookings" | "quotes" | "services" | "vendors">) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysQuotes = quotes.filter((quote) => quote.event?.date === today);
  const pendingQuotes = quotes.filter((quote) => quote.status === "pending");
  const upcomingBookings = bookings.filter(
    (booking) => booking.booking_status !== "cancelled",
  );
  const recentActivity = [...quotes.slice(0, 3), ...bookings.slice(0, 2)];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Businesses" value={String(vendors.length)} />
        <Metric label="Active services" value={String(services.filter((service) => service.active).length)} />
        <Metric label="Today's quote requests" value={String(todaysQuotes.length)} />
        <Metric label="Pending responses" value={String(pendingQuotes.length)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Upcoming bookings">
          {upcomingBookings.length ? (
            upcomingBookings.slice(0, 5).map((booking) => (
              <Row
                key={booking.id}
                title={formatMoney(booking.final_price)}
                detail={`${booking.booking_status} - ${booking.payment_status}`}
              />
            ))
          ) : (
            <EmptyLine text="No confirmed bookings yet." />
          )}
        </Panel>
        <Panel title="Recent activity">
          {recentActivity.length ? (
            recentActivity.map((item) => (
              <Row
                key={item.id}
                title={"status" in item ? item.status : item.booking_status}
                detail={"created_at" in item ? formatDate(item.created_at.slice(0, 10)) : ""}
              />
            ))
          ) : (
            <EmptyLine text="Activity appears here as planners request quotes and confirm bookings." />
          )}
        </Panel>
      </div>
    </div>
  );
}

export function ServicesTab({
  onCreateService,
  onToggleService,
  services,
  vendors,
}: Pick<VendorTabProps, "onCreateService" | "onToggleService" | "services" | "vendors">) {
  const [draft, setDraft] = useState<ServiceDraft>({
    basePrice: 300,
    category: "DJ",
    hourlyRate: 100,
    minimumHours: 3,
    pricingType: "hourly",
    serviceName: "DJ package",
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Create service">
        <div className="grid gap-3">
          <Input label="Service name" value={draft.serviceName} onChange={(value) => setDraft({ ...draft, serviceName: value })} />
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Category
            <select
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3"
            >
              {allServices.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Pricing
            <select
              value={draft.pricingType}
              onChange={(event) =>
                setDraft({ ...draft, pricingType: event.target.value as PricingType })
              }
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3"
            >
              <option value="hourly">Hourly</option>
              <option value="flat">Flat</option>
              <option value="per_guest">Per guest</option>
            </select>
          </label>
          <Input
            label={draft.pricingType === "hourly" ? "Hourly rate" : "Base price"}
            type="number"
            value={String(draft.pricingType === "hourly" ? draft.hourlyRate : draft.basePrice)}
            onChange={(value) =>
              setDraft({
                ...draft,
                ...(draft.pricingType === "hourly"
                  ? { hourlyRate: Number(value) }
                  : { basePrice: Number(value) }),
              })
            }
          />
          {draft.pricingType === "hourly" ? (
            <Input
              label="Minimum hours"
              type="number"
              value={String(draft.minimumHours)}
              onChange={(value) => setDraft({ ...draft, minimumHours: Number(value) })}
            />
          ) : null}
          <button
            type="button"
            onClick={() => onCreateService(draft)}
            disabled={!vendors.length}
            className="h-11 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create service
          </button>
        </div>
      </Panel>
      <Panel title="Services">
        {services.length ? (
          services.map((service) => (
            <div key={service.id} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-950">{service.service_name}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {service.category} - {service.pricing_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleService(service)}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold"
                >
                  {service.active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyLine text="Create your first service to appear in the marketplace." />
        )}
      </Panel>
    </div>
  );
}

export function AvailabilityTab({
  availability,
  onCreateAvailability,
  vendors,
}: Pick<VendorTabProps, "availability" | "onCreateAvailability" | "vendors">) {
  const [draft, setDraft] = useState<AvailabilityDraft>({
    date: "",
    endTime: "17:00",
    startTime: "09:00",
    status: "available",
    vendorId: vendors[0]?.id ?? "",
  });
  const weeklyDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Business hours">
        <div className="grid gap-3">
          <div className="grid grid-cols-7 gap-2">
            {weeklyDays.map((day) => (
              <span
                key={day}
                className="rounded-lg border border-neutral-200 bg-[#f7f7f5] px-2 py-3 text-center text-xs font-semibold"
              >
                {day}
              </span>
            ))}
          </div>
          <Input label="Default start" type="time" value={draft.startTime} onChange={(value) => setDraft({ ...draft, startTime: value })} />
          <Input label="Default end" type="time" value={draft.endTime} onChange={(value) => setDraft({ ...draft, endTime: value })} />
          <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
            Weekly schedule and vacation mode are represented in the dashboard UI. Persisted availability currently uses dated availability rows.
          </div>
        </div>
      </Panel>
      <Panel title="Manual availability">
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Vendor
            <select
              value={draft.vendorId}
              onChange={(event) => setDraft({ ...draft, vendorId: event.target.value })}
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3"
            >
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.business_name}
                </option>
              ))}
            </select>
          </label>
          <Input label="Date" type="date" value={draft.date} onChange={(value) => setDraft({ ...draft, date: value })} />
          <label className="grid gap-2 text-sm font-semibold text-neutral-800">
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  status: event.target.value as AvailabilityDraft["status"],
                })
              }
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3"
            >
              <option value="available">Available</option>
              <option value="blocked">Blackout date</option>
              <option value="tentative">Tentative</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => onCreateAvailability(draft)}
            disabled={!draft.date || !draft.vendorId}
            className="h-11 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save availability
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {availability.length ? (
            availability.map((window) => (
              <Row
                key={window.id}
                title={`${formatDate(window.date)} - ${window.status}`}
                detail={`${formatTime(window.start_time)} to ${formatTime(window.end_time)}`}
              />
            ))
          ) : (
            <EmptyLine text="No availability rows saved yet." />
          )}
        </div>
      </Panel>
    </div>
  );
}

export function PhotosTab({ photos }: Pick<VendorTabProps, "photos">) {
  return (
    <Panel title="Photos">
      <div className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
        Upload UI is prepared for the future file-upload milestone. For now, photos read from vendor_photos and render in marketplace cards.
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {photos.length ? (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="h-40 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${photo.image_url})` }}
            />
          ))
        ) : (
          <EmptyLine text="No vendor photos in the database yet." />
        )}
      </div>
    </Panel>
  );
}

export function QuotesTab({
  onRespondQuote,
  quotes,
}: Pick<VendorTabProps, "onRespondQuote" | "quotes">) {
  const [counterPrices, setCounterPrices] = useState<Record<string, string>>({});

  return (
    <Panel title="Quote requests">
      {quotes.length ? (
        quotes.map((quote) => (
          <div key={quote.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="font-semibold text-neutral-950">
                  {quote.event?.title ?? "Planner event"}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {quote.event?.event_type ?? "Event"} -{" "}
                  {formatDate(quote.event?.date)} -{" "}
                  {quote.guest_count ?? quote.event?.guest_count ?? 0} guests
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Requested: {formatTime(quote.requested_start_time)} to{" "}
                  {formatTime(quote.requested_end_time)}
                </p>
              </div>
              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                {quote.status}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="min-w-32">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  Estimate
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatMoney(quote.vendor_final_price ?? quote.estimated_price)}
                </p>
              </div>
              <Input
                label="Counter price"
                type="number"
                value={counterPrices[quote.id] ?? ""}
                onChange={(value) =>
                  setCounterPrices((current) => ({
                    ...current,
                    [quote.id]: value,
                  }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <QuoteButton label="Accept" onClick={() => onRespondQuote(quote.id, "accepted", null)} />
                <QuoteButton
                  label="Counter"
                  primary
                  onClick={() =>
                    onRespondQuote(
                      quote.id,
                      "countered",
                      Number(counterPrices[quote.id] ?? 0),
                    )
                  }
                />
                <QuoteButton label="Decline" onClick={() => onRespondQuote(quote.id, "declined", null)} />
              </div>
            </div>
          </div>
        ))
      ) : (
        <EmptyLine text="No incoming quote requests yet." />
      )}
    </Panel>
  );
}

export function BookingsTab({ bookings }: Pick<VendorTabProps, "bookings">) {
  return (
    <Panel title="Confirmed bookings">
      {bookings.length ? (
        bookings.map((booking) => (
          <Row
            key={booking.id}
            title={formatMoney(booking.final_price)}
            detail={`${booking.booking_status} - deposit ${formatMoney(booking.deposit_amount)} - balance ${formatMoney(booking.balance_due)}`}
          />
        ))
      ) : (
        <EmptyLine text="No bookings yet. Accepted quotes become bookings when planners confirm." />
      )}
    </Panel>
  );
}

export function ProfileTab({ vendors }: Pick<VendorTabProps, "vendors">) {
  return (
    <Panel title="Public profile">
      {vendors.length ? (
        vendors.map((vendor) => (
          <Row
            key={vendor.id}
            title={vendor.business_name}
            detail={`${vendor.category} - ${vendor.service_area_city ?? "No city"} - ${vendor.service_radius_miles} mile radius`}
          />
        ))
      ) : (
        <EmptyLine text="Create a vendor profile to publish your business." />
      )}
    </Panel>
  );
}

export function BusinessSettingsTab({
  onUpdateBusiness,
  vendors,
}: Pick<VendorTabProps, "onUpdateBusiness" | "vendors">) {
  const vendor = vendors[0];
  const [draft, setDraft] = useState<BusinessDraft>({
    businessName: vendor?.business_name ?? "",
    category: vendor?.category ?? "DJ",
    city: vendor?.service_area_city ?? "Los Angeles",
    description: vendor?.description ?? "",
    phone: vendor?.phone ?? "",
    radius: vendor?.service_radius_miles ?? 30,
    websiteUrl: vendor?.website_url ?? "",
  });

  if (!vendor) {
    return (
      <Panel title="Business settings">
        <EmptyLine text="Create a vendor profile before editing business settings." />
      </Panel>
    );
  }

  return (
    <Panel title="Business settings">
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Business name" value={draft.businessName} onChange={(value) => setDraft({ ...draft, businessName: value })} />
        <label className="grid gap-2 text-sm font-semibold text-neutral-800">
          Category
          <select
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            className="h-11 rounded-lg border border-neutral-300 bg-white px-3"
          >
            {allServices.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>
        <Input label="Service city" value={draft.city} onChange={(value) => setDraft({ ...draft, city: value })} />
        <Input label="Radius miles" type="number" value={String(draft.radius)} onChange={(value) => setDraft({ ...draft, radius: Number(value) })} />
        <Input label="Website" value={draft.websiteUrl} onChange={(value) => setDraft({ ...draft, websiteUrl: value })} />
        <Input label="Phone" value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
      </div>
      <label className="mt-3 grid gap-2 text-sm font-semibold text-neutral-800">
        Description
        <textarea
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          className="min-h-28 rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={() => onUpdateBusiness(vendor.id, draft)}
        className="mt-4 h-11 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white"
      >
        Save business
      </button>
    </Panel>
  );
}

export function AnalyticsTab({
  bookings,
  quotes,
  services,
}: Pick<VendorTabProps, "bookings" | "quotes" | "services">) {
  const revenue = bookings.reduce((total, booking) => total + Number(booking.final_price ?? 0), 0);
  const responseRate = quotes.length
    ? Math.round(
        (quotes.filter((quote) => quote.status !== "pending").length / quotes.length) * 100,
      )
    : 0;
  const categoryMix = useMemo(
    () =>
      services.reduce<Record<string, number>>((mix, service) => {
        mix[service.category] = (mix[service.category] ?? 0) + 1;
        return mix;
      }, {}),
    [services],
  );

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Metric label="Quoted requests" value={String(quotes.length)} />
      <Metric label="Response rate" value={`${responseRate}%`} />
      <Metric label="Booked revenue" value={formatMoney(revenue)} />
      <Panel title="Category mix">
        {Object.entries(categoryMix).length ? (
          Object.entries(categoryMix).map(([category, count]) => (
            <Row key={category} title={category} detail={`${count} service${count === 1 ? "" : "s"}`} />
          ))
        ) : (
          <EmptyLine text="Create services to see category mix." />
        )}
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-[0_18px_44px_rgba(20,20,20,0.05)]">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Row({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{detail}</p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">
      {text}
    </p>
  );
}

function Input({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-neutral-300 px-3 outline-none focus:border-neutral-950"
      />
    </label>
  );
}

function QuoteButton({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-sm font-semibold ${
        primary
          ? "bg-[#ff5a5f] text-white"
          : "border border-neutral-300 text-neutral-950"
      }`}
    >
      {label}
    </button>
  );
}
