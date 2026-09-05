// Centralized enums / constants shared between the frontend, backend and
// database. Keep this file in sync with the SQL enums defined in
// supabase/migrations. Never hand-roll new spellings of these values
// anywhere else in the app.

export const USER_ROLES = [
  "customer",
  "staff",
  "warehouse",
  "driver",
  "admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REGIONS = ["visayas", "mindanao"] as const;
export type Region = (typeof REGIONS)[number];

export const REQUEST_STATUSES = [
  "requested",
  "reviewed",
  "quote_provided",
  "declined",
  "cancelled",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  requested: "Requested",
  reviewed: "Reviewed by Admin",
  quote_provided: "Quote Provided",
  declined: "Declined",
  cancelled: "Cancelled",
};

export const SCHEDULE_STATUSES = [
  "scheduled",
  "closed",
  "completed",
  "cancelled",
] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export const SPECIAL_HANDLING_OPTIONS = [
  "fragile",
  "medical",
  "heavy",
  "oversized",
  "high_value",
  "special_protection",
  "other",
] as const;
export type SpecialHandling = (typeof SPECIAL_HANDLING_OPTIONS)[number];

export const SPECIAL_HANDLING_LABELS: Record<SpecialHandling, string> = {
  fragile: "Fragile",
  medical: "Medical",
  heavy: "Heavy",
  oversized: "Oversized",
  high_value: "High Value",
  special_protection: "Special Protection",
  other: "Other",
};

export const MOVING_TYPES = ["house", "office", "condo"] as const;
export type MovingType = (typeof MOVING_TYPES)[number];

export const MOVING_TYPE_LABELS: Record<MovingType, string> = {
  house: "Lipat Bahay (House)",
  office: "Office Transfer",
  condo: "Condo Transfer",
};

// Shipment lifecycle statuses are defined now (per project-wide status
// contract) even though the `shipments` table itself is built in Phase 2.
export const SHIPMENT_STATUSES = [
  "booked",
  "awaiting_pickup",
  "cargo_received",
  "at_warehouse",
  "consolidating",
  "ready_for_loading",
  "loaded",
  "in_transit",
  "at_destination_hub",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "on_hold",
  "issue_reported",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const COMPANY = {
  name: "FATE CARGO",
  productName: "FATE CARGO 360",
  tagline: "From booking to doorstep, everything connected.",
  positioning:
    "With FATE CARGO, we are dedicated to your business. We will provide you our COMPETITIVE RATES, BEST CUSTOMER SERVICE and SPECIAL HANDLING PROCESS.",
  address: "San Dionisio, Parañaque City",
  phones: ["09270796185", "09683929679"],
} as const;

export const SERVICES = [
  { slug: "door-to-door", name: "Door to Door Delivery" },
  { slug: "consolidation", name: "Domestic Cargo Consolidation" },
  { slug: "lipat-bahay", name: "Lipat Bahay" },
  { slug: "office-transfer", name: "Office Transfer" },
  { slug: "condo-transfer", name: "Condo Transfer" },
] as const;

export const CARGO_CATEGORIES = [
  "Commercial Products",
  "Medical Supplies",
  "Medical Equipment",
  "Construction Materials",
  "Telco Products",
  "Personal Effects",
  "Balikbayan Boxes",
  "Ukay Bales",
  "General Cargo",
] as const;

export const DESTINATIONS: { name: string; region: Region }[] = [
  { name: "Mindoro", region: "visayas" },
  { name: "Caticlan / Kalibo, Aklan", region: "visayas" },
  { name: "Boracay Island", region: "visayas" },
  { name: "Iloilo", region: "visayas" },
  { name: "Bacolod", region: "visayas" },
  { name: "Cebu", region: "visayas" },
  { name: "Tacloban / Leyte", region: "mindanao" },
  { name: "Surigao", region: "mindanao" },
  { name: "Butuan", region: "mindanao" },
  { name: "Cagayan de Oro", region: "mindanao" },
  { name: "Davao", region: "mindanao" },
  { name: "General Santos", region: "mindanao" },
];
