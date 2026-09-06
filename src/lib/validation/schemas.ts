import { z } from "zod";
import { MOVING_TYPES, SPECIAL_HANDLING_OPTIONS } from "@/lib/constants";

const phoneRegex = /^(\+63|0)9\d{9}$/;

export const quoteRequestSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid PH mobile number (e.g. 09171234567)"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
  origin: z.string().trim().min(2, "Origin is required").max(200),
  destination_id: z.string().uuid().optional().or(z.literal("")),
  destination_text: z.string().trim().max(200).optional(),
  cargo_category_id: z.string().uuid().optional().or(z.literal("")),
  cargo_description: z.string().trim().max(1000).optional(),
  number_of_packages: z.coerce.number().int().positive().max(100000).optional(),
  weight_kg: z.coerce.number().nonnegative().max(1000000).optional(),
  length_cm: z.coerce.number().nonnegative().max(100000).optional(),
  width_cm: z.coerce.number().nonnegative().max(100000).optional(),
  height_cm: z.coerce.number().nonnegative().max(100000).optional(),
  special_handling: z.array(z.enum(SPECIAL_HANDLING_OPTIONS)).default([]),
  pickup_required: z.boolean().default(true),
  additional_notes: z.string().trim().max(2000).optional(),
});
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const movingRequestSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid PH mobile number (e.g. 09171234567)"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
  moving_type: z.enum(MOVING_TYPES),
  pickup_location: z.string().trim().min(2, "Pickup location is required").max(300),
  destination_location: z.string().trim().min(2, "Destination is required").max(300),
  preferred_date: z.string().optional(),
  rooms_estimate: z.string().trim().max(200).optional(),
  major_items: z.string().trim().max(1000).optional(),
  elevator_available: z.boolean().optional(),
  stairs: z.boolean().optional(),
  special_items: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type MovingRequestInput = z.infer<typeof movingRequestSchema>;

export const trackingSchema = z.object({
  code: z.string().trim().min(4, "Enter a valid FATE Cargo ID or tracking code").max(60),
});

export const otpRequestSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Enter a valid PH mobile number (e.g. 09171234567)"),
});

export const otpVerifySchema = z.object({
  phone: z.string().trim().regex(phoneRegex),
  token: z.string().trim().length(6, "Enter the 6-digit code"),
});

export const profileSetupSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
});

const phFlexiblePhone = /^(\+63|0)9\d{9}$/;

export const bookingSchema = z.object({
  service_id: z.string().uuid().optional().or(z.literal("")),

  origin_address: z.string().trim().min(5, "Pickup address is required").max(300),
  origin_city: z.string().trim().max(150).optional(),
  origin_contact_name: z.string().trim().max(150).optional(),
  origin_contact_phone: z.union([z.literal(""), z.string().trim().regex(phFlexiblePhone, "Enter a valid PH mobile number")]).optional(),
  pickup_required: z.boolean().default(true),
  pickup_date: z.string().optional(),
  pickup_time: z.string().trim().max(50).optional(),
  pickup_notes: z.string().trim().max(1000).optional(),

  destination_id: z.string().uuid().optional().or(z.literal("")),
  destination_address: z.string().trim().max(300).optional(),
  recipient_name: z.string().trim().max(150).optional(),
  recipient_phone: z.union([z.literal(""), z.string().trim().regex(phFlexiblePhone, "Enter a valid PH mobile number")]).optional(),
  delivery_notes: z.string().trim().max(1000).optional(),

  cargo_category_id: z.string().uuid().optional().or(z.literal("")),
  cargo_description: z.string().trim().max(1000).optional(),
  number_of_packages: z.coerce.number().int().positive().max(100000).optional(),
  package_type: z.string().trim().max(50).optional(),
  weight_kg: z.coerce.number().positive("Weight must be greater than 0").max(1000000),
  length_cm: z.coerce.number().nonnegative().max(100000).optional(),
  width_cm: z.coerce.number().nonnegative().max(100000).optional(),
  height_cm: z.coerce.number().nonnegative().max(100000).optional(),

  special_handling: z.array(z.enum(SPECIAL_HANDLING_OPTIONS)).default([]),
  special_handling_notes: z.string().trim().max(1000).optional(),

  customer_notes: z.string().trim().max(2000).optional(),
}).refine((data) => !data.pickup_required || !!data.pickup_date, {
  message: "Preferred pickup date is required when pickup is needed",
  path: ["pickup_date"],
});
export type BookingInput = z.infer<typeof bookingSchema>;
