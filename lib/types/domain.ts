export type UserRole = "planner" | "vendor" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

export type EventStatus =
  | "draft"
  | "planning"
  | "quote_requested"
  | "booked"
  | "completed"
  | "cancelled";

export type QuoteStatus =
  | "pending"
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "countered"
  | "expired"
  | "cancelled";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaymentStatus =
  | "not_started"
  | "deposit_due"
  | "deposit_paid"
  | "paid"
  | "refunded";

export type CartItemStatus = "draft" | "quote_requested" | "removed";

export type PricingType = "flat" | "hourly" | "per_guest";

export type AvailabilityStatus = "available" | "blocked" | "tentative";

export type ItemType = "vendor_service" | "venue";

export type RsvpStatus = "pending" | "yes" | "no" | "maybe";

export type AdminDecision = "approved" | "rejected";
