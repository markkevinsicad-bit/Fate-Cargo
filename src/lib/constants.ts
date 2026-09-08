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

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  booked: "Booked",
  awaiting_pickup: "Awaiting Pickup",
  cargo_received: "Cargo Received",
  at_warehouse: "At Warehouse",
  consolidating: "Consolidating",
  ready_for_loading: "Ready for Loading",
  loaded: "Loaded",
  in_transit: "In Transit",
  at_destination_hub: "At Destination Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  on_hold: "On Hold",
  issue_reported: "Issue Reported",
};

/** Coarse grouping used for dashboard filters ("Active" vs "Delivered" etc). */
export const ACTIVE_SHIPMENT_STATUSES: ShipmentStatus[] = [
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
];

export const PACKAGE_TYPES = [
  "Box",
  "Carton",
  "Crate",
  "Pallet",
  "Sack",
  "Drum",
  "Bag",
  "Bundle",
  "Other",
] as const;

export const CARGO_CONDITION_STAGES = ["receiving", "pre_loading", "arrival", "delivery"] as const;
export type CargoConditionStage = (typeof CARGO_CONDITION_STAGES)[number];
export const CARGO_CONDITION_STAGE_LABELS: Record<CargoConditionStage, string> = {
  receiving: "Receiving",
  pre_loading: "Pre-Loading",
  arrival: "Arrival",
  delivery: "Delivery",
};

export const LOADING_TRIP_STATUSES = ["planned", "open", "loading", "departed", "completed", "cancelled"] as const;
export type LoadingTripStatus = (typeof LOADING_TRIP_STATUSES)[number];
export const LOADING_TRIP_STATUS_LABELS: Record<LoadingTripStatus, string> = {
  planned: "Planned",
  open: "Open",
  loading: "Loading",
  departed: "Departed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const QR_SCAN_TYPES = ["validation", "receiving", "warehouse", "loading", "delivery"] as const;
export type QrScanType = (typeof QR_SCAN_TYPES)[number];
export const QR_SCAN_TYPE_LABELS: Record<QrScanType, string> = {
  validation: "Validation",
  receiving: "Receiving",
  warehouse: "Warehouse",
  loading: "Loading",
  delivery: "Delivery",
};

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

// ---------------------------------------------------------------------
// Phase 3: pickup, delivery, leads, referrals, reviews
// ---------------------------------------------------------------------

export const PICKUP_STATUSES = [
  "requested",
  "scheduled",
  "assigned",
  "out_for_pickup",
  "arrived",
  "picked_up",
  "failed",
  "cancelled",
] as const;
export type PickupStatus = (typeof PICKUP_STATUSES)[number];
export const PICKUP_STATUS_LABELS: Record<PickupStatus, string> = {
  requested: "Requested",
  scheduled: "Scheduled",
  assigned: "Assigned",
  out_for_pickup: "Out for Pickup",
  arrived: "Arrived",
  picked_up: "Picked Up",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const DELIVERY_STATUSES = [
  "pending_assignment",
  "assigned",
  "out_for_delivery",
  "arrived",
  "delivered",
  "failed",
  "return_required",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending_assignment: "Pending Assignment",
  assigned: "Assigned",
  out_for_delivery: "Out for Delivery",
  arrived: "Arrived",
  delivered: "Delivered",
  failed: "Failed",
  return_required: "Return Required",
};

export const LEAD_STATUSES = ["new", "contacted", "quoted", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  converted: "Converted",
  lost: "Lost",
};

export const ORG_MEMBER_ROLES = ["member", "manager", "owner"] as const;
export type OrgMemberRole = (typeof ORG_MEMBER_ROLES)[number];

export const SAVED_ADDRESS_TYPES = ["pickup", "delivery", "both"] as const;
export type SavedAddressType = (typeof SAVED_ADDRESS_TYPES)[number];
