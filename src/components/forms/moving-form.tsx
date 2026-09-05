"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { movingRequestSchema, type MovingRequestInput } from "@/lib/validation/schemas";
import { MOVING_TYPES, MOVING_TYPE_LABELS } from "@/lib/constants";
import { submitMovingRequest } from "@/actions/moving";

export function MovingForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<z.input<typeof movingRequestSchema>, unknown, MovingRequestInput>({
    resolver: zodResolver(movingRequestSchema),
    defaultValues: { moving_type: "house" },
  });

  async function onSubmit(values: MovingRequestInput) {
    const result = await submitMovingRequest(values);
    if (result.success) {
      setSubmitted(true);
      reset();
      toast.success("Your moving request has been received.");
    } else {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof MovingRequestInput, { message });
        }
      }
      toast.error(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900">Your moving request has been received.</h3>
        <p className="max-w-md text-sm text-emerald-800">
          Our team will review the details and reach out with a quote for your move.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <FormField label="Type of Move" htmlFor="moving_type" required error={errors.moving_type?.message}>
        <Controller
          control={control}
          name="moving_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="moving_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOVING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {MOVING_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <section className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="full_name" required error={errors.full_name?.message}>
          <Input id="full_name" {...register("full_name")} />
        </FormField>
        <FormField label="Phone Number" htmlFor="phone" required error={errors.phone?.message} hint="e.g. 09171234567">
          <Input id="phone" {...register("phone")} />
        </FormField>
        <FormField label="Email (optional)" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField label="Preferred Date" htmlFor="preferred_date" error={errors.preferred_date?.message}>
          <Input id="preferred_date" type="date" {...register("preferred_date")} />
        </FormField>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pickup Location" htmlFor="pickup_location" required error={errors.pickup_location?.message}>
          <Input id="pickup_location" {...register("pickup_location")} />
        </FormField>
        <FormField label="Destination" htmlFor="destination_location" required error={errors.destination_location?.message}>
          <Input id="destination_location" {...register("destination_location")} />
        </FormField>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <FormField label="Number of Rooms / Estimated Size" htmlFor="rooms_estimate" error={errors.rooms_estimate?.message}>
          <Input id="rooms_estimate" placeholder="e.g. 2-bedroom condo" {...register("rooms_estimate")} />
        </FormField>
        <FormField label="Major Items" htmlFor="major_items" error={errors.major_items?.message}>
          <Input id="major_items" placeholder="e.g. sofa, refrigerator, bed frame" {...register("major_items")} />
        </FormField>
      </section>

      <section className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="elevator_available"
            render={({ field }) => (
              <Checkbox id="elevator_available" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="elevator_available">Elevator available</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="stairs"
            render={({ field }) => <Checkbox id="stairs" checked={field.value} onCheckedChange={field.onChange} />}
          />
          <Label htmlFor="stairs">Stairs involved</Label>
        </div>
      </section>

      <FormField label="Special Items" htmlFor="special_items" error={errors.special_items?.message} hint="Pianos, safes, aquariums, artwork, etc.">
        <Textarea id="special_items" rows={2} {...register("special_items")} />
      </FormField>

      <FormField label="Additional Notes" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </FormField>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Spinner className="text-white" />}
        Submit Moving Request
      </Button>
    </form>
  );
}
