"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpecialHandlingBadges } from "@/components/ui/special-handling-badges";
import { bookingSchema, type BookingInput } from "@/lib/validation/schemas";
import { SPECIAL_HANDLING_OPTIONS, SPECIAL_HANDLING_LABELS, PACKAGE_TYPES } from "@/lib/constants";
import { cubicMetersToDisplay } from "@/lib/utils";
import { createBooking } from "@/actions/booking";

type Option = { id: string; name: string };

export function BookingForm({
  services,
  destinations,
  cargoCategories,
  customer,
  initialValues,
}: {
  services: Option[];
  destinations: (Option & { region: string })[];
  cargoCategories: Option[];
  customer: { fullName: string; phone: string; email: string };
  initialValues?: Partial<z.input<typeof bookingSchema>>;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"form" | "review">("form");
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<BookingInput | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof bookingSchema>, unknown, BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickup_required: true,
      special_handling: [],
      ...initialValues,
    },
  });

  const [length, width, height] = watch(["length_cm", "width_cm", "height_cm"]);
  const volume =
    length && width && height ? (Number(length) * Number(width) * Number(height)) / 1_000_000 : null;

  function goToReview(values: BookingInput) {
    setReviewData(values);
    setMode("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleConfirm() {
    if (!reviewData || submitting) return;
    setSubmitting(true);
    const result = await createBooking(reviewData);
    if (result.success) {
      toast.success("Booking confirmed!");
      router.push(`/dashboard/shipments/${result.shipmentId}?confirmed=1`);
    } else {
      setSubmitting(false);
      toast.error(result.error);
      if (result.fieldErrors) setMode("form");
    }
  }

  const serviceName = services.find((s) => s.id === reviewData?.service_id)?.name;
  const destinationName = destinations.find((d) => d.id === reviewData?.destination_id)?.name;
  const cargoCategoryName = cargoCategories.find((c) => c.id === reviewData?.cargo_category_id)?.name;
  const reviewVolume =
    reviewData?.length_cm && reviewData?.width_cm && reviewData?.height_cm
      ? (reviewData.length_cm * reviewData.width_cm * reviewData.height_cm) / 1_000_000
      : null;

  if (mode === "review" && reviewData) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Please review your booking details before confirming. Once confirmed, a FATE Cargo ID and QR
          code will be generated for this shipment.
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <ReviewSection title="Customer">
              <ReviewRow label="Name" value={customer.fullName || "—"} />
              <ReviewRow label="Phone" value={customer.phone || "—"} />
              {customer.email && <ReviewRow label="Email" value={customer.email} />}
            </ReviewSection>

            <ReviewSection title="Pickup / Origin">
              <ReviewRow label="Address" value={reviewData.origin_address} />
              {reviewData.origin_city && <ReviewRow label="City / Area" value={reviewData.origin_city} />}
              {reviewData.origin_contact_name && (
                <ReviewRow label="Contact" value={reviewData.origin_contact_name} />
              )}
              {reviewData.origin_contact_phone && (
                <ReviewRow label="Contact Phone" value={reviewData.origin_contact_phone} />
              )}
              <ReviewRow label="Pickup Required" value={reviewData.pickup_required ? "Yes" : "No"} />
              {reviewData.pickup_required && reviewData.pickup_date && (
                <ReviewRow label="Preferred Date" value={reviewData.pickup_date} />
              )}
              {reviewData.pickup_time && <ReviewRow label="Preferred Time" value={reviewData.pickup_time} />}
              {reviewData.pickup_notes && <ReviewRow label="Notes" value={reviewData.pickup_notes} />}
            </ReviewSection>

            <ReviewSection title="Destination">
              <ReviewRow label="Destination" value={destinationName || "—"} />
              {reviewData.destination_address && (
                <ReviewRow label="Delivery Address" value={reviewData.destination_address} />
              )}
              {reviewData.recipient_name && <ReviewRow label="Recipient" value={reviewData.recipient_name} />}
              {reviewData.recipient_phone && (
                <ReviewRow label="Recipient Phone" value={reviewData.recipient_phone} />
              )}
              {reviewData.delivery_notes && (
                <ReviewRow label="Delivery Instructions" value={reviewData.delivery_notes} />
              )}
            </ReviewSection>

            <ReviewSection title="Service & Cargo">
              <ReviewRow label="Service" value={serviceName || "—"} />
              <ReviewRow label="Cargo Category" value={cargoCategoryName || "—"} />
              {reviewData.cargo_description && (
                <ReviewRow label="Description" value={reviewData.cargo_description} />
              )}
              {reviewData.number_of_packages && (
                <ReviewRow label="Packages" value={String(reviewData.number_of_packages)} />
              )}
              {reviewData.package_type && <ReviewRow label="Package Type" value={reviewData.package_type} />}
              <ReviewRow label="Weight" value={`${reviewData.weight_kg} kg`} />
              {reviewData.length_cm && reviewData.width_cm && reviewData.height_cm && (
                <ReviewRow
                  label="Dimensions"
                  value={`${reviewData.length_cm} × ${reviewData.width_cm} × ${reviewData.height_cm} cm${
                    reviewVolume ? ` (${cubicMetersToDisplay(reviewVolume)})` : ""
                  }`}
                />
              )}
            </ReviewSection>

            {reviewData.special_handling.length > 0 && (
              <ReviewSection title="Special Handling">
                <SpecialHandlingBadges items={reviewData.special_handling} />
                {reviewData.special_handling_notes && (
                  <p className="mt-2 text-sm text-slate-600">{reviewData.special_handling_notes}</p>
                )}
              </ReviewSection>
            )}

            {reviewData.customer_notes && (
              <ReviewSection title="Additional Notes">
                <p className="text-sm text-slate-600">{reviewData.customer_notes}</p>
              </ReviewSection>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setMode("form")} disabled={submitting}>
            <ArrowLeft className="h-4 w-4" /> Back / Edit
          </Button>
          <Button onClick={handleConfirm} disabled={submitting} size="lg">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Booking
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(goToReview)} className="space-y-8" noValidate>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Customer Information</h2>
        <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Name</p>
            <p className="text-sm text-slate-800">{customer.fullName || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Phone</p>
            <p className="text-sm text-slate-800">{customer.phone || "Not set"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Email</p>
            <p className="text-sm text-slate-800">{customer.email || "Not provided"}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          To update your name or email, visit your{" "}
          <a href="/dashboard/profile" className="text-primary hover:underline">
            profile settings
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Pickup / Origin</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Pickup Address" htmlFor="origin_address" required error={errors.origin_address?.message} className="sm:col-span-2">
            <Input id="origin_address" {...register("origin_address")} />
          </FormField>
          <FormField label="City / Area" htmlFor="origin_city" error={errors.origin_city?.message}>
            <Input id="origin_city" {...register("origin_city")} />
          </FormField>
          <FormField label="Contact Person" htmlFor="origin_contact_name" error={errors.origin_contact_name?.message}>
            <Input id="origin_contact_name" {...register("origin_contact_name")} />
          </FormField>
          <FormField label="Contact Phone" htmlFor="origin_contact_phone" error={errors.origin_contact_phone?.message}>
            <Input id="origin_contact_phone" {...register("origin_contact_phone")} />
          </FormField>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Controller
              control={control}
              name="pickup_required"
              render={({ field }) => (
                <Checkbox id="pickup_required" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="pickup_required">I need pickup service from my location</Label>
          </div>
          <FormField label="Preferred Pickup Date" htmlFor="pickup_date" error={errors.pickup_date?.message}>
            <Input id="pickup_date" type="date" {...register("pickup_date")} />
          </FormField>
          <FormField label="Preferred Pickup Time" htmlFor="pickup_time" error={errors.pickup_time?.message}>
            <Input id="pickup_time" placeholder="e.g. Morning, 2:00 PM" {...register("pickup_time")} />
          </FormField>
          <FormField label="Pickup Notes" htmlFor="pickup_notes" error={errors.pickup_notes?.message} className="sm:col-span-2">
            <Textarea id="pickup_notes" rows={2} {...register("pickup_notes")} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Destination</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Destination" htmlFor="destination_id" error={errors.destination_id?.message}>
            <Controller
              control={control}
              name="destination_id"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="destination_id">
                    <SelectValue placeholder="Select a destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Delivery Address" htmlFor="destination_address" error={errors.destination_address?.message}>
            <Input id="destination_address" {...register("destination_address")} />
          </FormField>
          <FormField label="Recipient Name" htmlFor="recipient_name" error={errors.recipient_name?.message}>
            <Input id="recipient_name" {...register("recipient_name")} />
          </FormField>
          <FormField label="Recipient Phone" htmlFor="recipient_phone" error={errors.recipient_phone?.message}>
            <Input id="recipient_phone" {...register("recipient_phone")} />
          </FormField>
          <FormField label="Delivery Instructions" htmlFor="delivery_notes" error={errors.delivery_notes?.message} className="sm:col-span-2">
            <Textarea id="delivery_notes" rows={2} {...register("delivery_notes")} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Service & Cargo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Service" htmlFor="service_id" error={errors.service_id?.message}>
            <Controller
              control={control}
              name="service_id"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="service_id">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Cargo Category" htmlFor="cargo_category_id" error={errors.cargo_category_id?.message}>
            <Controller
              control={control}
              name="cargo_category_id"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="cargo_category_id">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargoCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Cargo Description" htmlFor="cargo_description" error={errors.cargo_description?.message} className="sm:col-span-2">
            <Textarea id="cargo_description" rows={2} {...register("cargo_description")} />
          </FormField>
          <FormField label="Number of Packages" htmlFor="number_of_packages" error={errors.number_of_packages?.message}>
            <Input id="number_of_packages" type="number" min={1} {...register("number_of_packages")} />
          </FormField>
          <FormField label="Package Type" htmlFor="package_type" error={errors.package_type?.message}>
            <Controller
              control={control}
              name="package_type"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="package_type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-800">Weight & Dimensions</p>
          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Weight (kg)" htmlFor="weight_kg" required error={errors.weight_kg?.message}>
              <Input id="weight_kg" type="number" step="0.1" min={0.1} {...register("weight_kg")} />
            </FormField>
            <FormField label="Length (cm)" htmlFor="length_cm" error={errors.length_cm?.message}>
              <Input id="length_cm" type="number" step="0.1" min={0} {...register("length_cm")} />
            </FormField>
            <FormField label="Width (cm)" htmlFor="width_cm" error={errors.width_cm?.message}>
              <Input id="width_cm" type="number" step="0.1" min={0} {...register("width_cm")} />
            </FormField>
            <FormField label="Height (cm)" htmlFor="height_cm" error={errors.height_cm?.message}>
              <Input id="height_cm" type="number" step="0.1" min={0} {...register("height_cm")} />
            </FormField>
          </div>
          {volume != null && (
            <p className="mt-2 text-sm text-slate-500">Estimated volume: {cubicMetersToDisplay(volume)}</p>
          )}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-medium text-slate-800">Special Handling</p>
        <Controller
          control={control}
          name="special_handling"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SPECIAL_HANDLING_OPTIONS.map((opt) => {
                const checked = field.value?.includes(opt) ?? false;
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const set = new Set(field.value ?? []);
                        if (v) set.add(opt);
                        else set.delete(opt);
                        field.onChange(Array.from(set));
                      }}
                    />
                    {SPECIAL_HANDLING_LABELS[opt]}
                  </label>
                );
              })}
            </div>
          )}
        />
        <FormField label="Special Handling Notes" htmlFor="special_handling_notes" error={errors.special_handling_notes?.message} className="mt-3">
          <Textarea id="special_handling_notes" rows={2} {...register("special_handling_notes")} />
        </FormField>
      </section>

      <FormField label="Additional Notes" htmlFor="customer_notes" error={errors.customer_notes?.message}>
        <Textarea id="customer_notes" rows={3} {...register("customer_notes")} />
      </FormField>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Review Booking <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-2">
      <span className="font-medium text-slate-500 sm:w-40 sm:shrink-0">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
