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
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validation/schemas";
import { SPECIAL_HANDLING_OPTIONS, SPECIAL_HANDLING_LABELS } from "@/lib/constants";
import { submitQuoteRequest } from "@/actions/quotes";
import { cubicMetersToDisplay } from "@/lib/utils";

type Option = { id: string; name: string };

export function QuoteForm({
  destinations,
  cargoCategories,
}: {
  destinations: Option[];
  cargoCategories: Option[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<z.input<typeof quoteRequestSchema>, unknown, QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      pickup_required: true,
      special_handling: [],
    },
  });

  const [length, width, height] = watch(["length_cm", "width_cm", "height_cm"]);
  const volume =
    length && width && height ? ((Number(length) * Number(width) * Number(height)) / 1_000_000).toFixed(4) : null;

  async function onSubmit(values: QuoteRequestInput) {
    const result = await submitQuoteRequest(values);
    if (result.success) {
      setSubmitted(true);
      reset();
      toast.success("Your quote request has been received.");
    } else {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof QuoteRequestInput, { message });
        }
      }
      toast.error(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900">Your quote request has been received.</h3>
        <p className="max-w-md text-sm text-emerald-800">
          Our team will review your request and get back to you with a quote. You can also log in to track
          the status from your dashboard.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <section className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full Name" htmlFor="full_name" required error={errors.full_name?.message}>
          <Input id="full_name" {...register("full_name")} aria-invalid={!!errors.full_name} />
        </FormField>
        <FormField label="Phone Number" htmlFor="phone" required error={errors.phone?.message} hint="e.g. 09171234567">
          <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
        </FormField>
        <FormField label="Email (optional)" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        </FormField>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <FormField label="Origin" htmlFor="origin" required error={errors.origin?.message}>
          <Input id="origin" placeholder="e.g. Parañaque City" {...register("origin")} aria-invalid={!!errors.origin} />
        </FormField>
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
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
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
        <FormField label="Number of Packages" htmlFor="number_of_packages" error={errors.number_of_packages?.message}>
          <Input id="number_of_packages" type="number" min={1} {...register("number_of_packages")} />
        </FormField>
      </section>

      <FormField label="Cargo Description" htmlFor="cargo_description" error={errors.cargo_description?.message}>
        <Textarea id="cargo_description" rows={3} {...register("cargo_description")} />
      </FormField>

      <section>
        <p className="mb-2 text-sm font-medium text-slate-800">Package Dimensions (cm) & Weight (kg)</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <FormField label="Weight (kg)" htmlFor="weight_kg" error={errors.weight_kg?.message}>
            <Input id="weight_kg" type="number" step="0.1" min={0} {...register("weight_kg")} />
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
        {volume && <p className="mt-2 text-sm text-slate-500">Estimated volume: {cubicMetersToDisplay(Number(volume))}</p>}
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
      </section>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="pickup_required"
          render={({ field }) => (
            <Checkbox id="pickup_required" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="pickup_required">I need pickup service from my location</Label>
      </div>

      <FormField label="Additional Notes" htmlFor="additional_notes" error={errors.additional_notes?.message}>
        <Textarea id="additional_notes" rows={3} {...register("additional_notes")} />
      </FormField>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Spinner className="text-white" />}
        Submit Quote Request
      </Button>
    </form>
  );
}
