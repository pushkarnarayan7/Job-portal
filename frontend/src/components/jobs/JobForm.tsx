import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, EyeOff, Gift, FileText } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { JobPayload } from "@/services/jobs.service";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  openings: z.coerce
    .number({ invalid_type_error: "Openings must be a number" })
    .int("Openings must be a whole number")
    .min(1, "There must be at least 1 opening"),
  description: z.string().max(5000, "Keep description under 5000 characters").optional(),
  hideSalary: z.boolean().default(false),
  salaryMin: z.coerce
    .number({ invalid_type_error: "Min salary must be a number" })
    .min(0, "Salary cannot be negative")
    .optional(),
  salaryMax: z.coerce
    .number({ invalid_type_error: "Max salary must be a number" })
    .min(0, "Salary cannot be negative")
    .optional(),
  salaryCurrency: z.string().default("USD"),
  salaryPeriod: z.string().default("year"),
  benefits: z.string().max(2000, "Keep benefits under 2000 characters").optional(),
  eligibility: z.string().max(2000, "Keep eligibility under 2000 characters").optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export interface PartialJobFormValues {
  title?: string;
  company?: string;
  openings?: number;
  description?: string;
  discloseSalary?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  benefits?: string[] | string;
  eligibility?: string;
}

interface JobFormProps {
  defaultValues?: PartialJobFormValues;
  submitLabel: string;
  onSubmit: (payload: JobPayload) => Promise<void>;
}

export function JobForm({ defaultValues, submitLabel, onSubmit }: JobFormProps) {
  const initialBenefits = Array.isArray(defaultValues?.benefits)
    ? defaultValues.benefits.join(", ")
    : defaultValues?.benefits ?? "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      company: defaultValues?.company ?? "",
      openings: defaultValues?.openings ?? 1,
      description: defaultValues?.description ?? "",
      hideSalary: defaultValues?.discloseSalary === false,
      salaryMin: defaultValues?.salaryMin ?? 0,
      salaryMax: defaultValues?.salaryMax ?? 0,
      salaryCurrency: defaultValues?.salaryCurrency ?? "USD",
      salaryPeriod: defaultValues?.salaryPeriod ?? "year",
      benefits: initialBenefits,
      eligibility: defaultValues?.eligibility ?? "",
    },
  });

  const hideSalary = watch("hideSalary");

  const submit = handleSubmit(async (data) => {
    const parsedBenefits = data.benefits
      ? data.benefits
          .split(/[,;\n]/)
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    await onSubmit({
      title: data.title,
      company: data.company,
      openings: data.openings,
      description: data.description?.trim() || undefined,
      discloseSalary: !data.hideSalary,
      salaryMin: data.hideSalary ? 0 : data.salaryMin || 0,
      salaryMax: data.hideSalary ? 0 : data.salaryMax || 0,
      salaryCurrency: data.salaryCurrency || "USD",
      salaryPeriod: data.salaryPeriod || "year",
      benefits: parsedBenefits,
      eligibility: data.eligibility?.trim() || undefined,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {/* Basic Role Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Role Information
        </h3>
        <Input
          label="Job title *"
          placeholder="e.g. Senior Frontend Engineer"
          error={errors.title?.message}
          {...register("title")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company name *"
            placeholder="e.g. TechNova Inc."
            error={errors.company?.message}
            {...register("company")}
          />
          <Input
            label="Number of openings *"
            type="number"
            min={1}
            error={errors.openings?.message}
            {...register("openings")}
          />
        </div>
      </div>

      {/* Detailed Description */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Detailed Description
          </h3>
        </div>
        <Textarea
          label="Job Overview & Responsibilities"
          rows={5}
          placeholder="Provide a detailed overview of the role, responsibilities, project scope, team culture, and day-to-day expectations..."
          hint="Comprehensive job descriptions attract higher quality candidate applications."
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      {/* Compensation & Salary Range */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Compensation & Salary</h3>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              {...register("hideSalary")}
            />
            <EyeOff className="h-3.5 w-3.5 text-slate-500" />
            <span>Do not disclose salary</span>
          </label>
        </div>

        {hideSalary ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <p className="font-medium">Salary Range Undisclosed</p>
            <p className="mt-0.5 text-amber-700">
              Salary information will be hidden from candidates and displayed as &quot;Salary Undisclosed / Confidential&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Currency
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register("salaryCurrency")}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Frequency
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register("salaryPeriod")}
                >
                  <option value="year">Per Year (Annual)</option>
                  <option value="month">Per Month</option>
                  <option value="hour">Per Hour</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Minimum Salary"
                type="number"
                placeholder="e.g. 80000"
                error={errors.salaryMin?.message}
                {...register("salaryMin")}
              />
              <Input
                label="Maximum Salary"
                type="number"
                placeholder="e.g. 120000"
                error={errors.salaryMax?.message}
                {...register("salaryMax")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Perks & Benefits */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Perks &amp; Benefits
          </h3>
        </div>
        <Textarea
          label="Benefits Offered"
          rows={3}
          placeholder="e.g. Health & Dental Insurance, Flexible Working Hours, 401(k) Matching, Remote Work Stipend, Paid Time Off"
          hint="Separate benefits with commas or line breaks."
          error={errors.benefits?.message}
          {...register("benefits")}
        />
      </div>

      {/* Eligibility & Requirements */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Eligibility &amp; Checklist
        </h3>
        <Textarea
          label="Eligibility & Requirements"
          rows={4}
          placeholder="e.g. 3+ years React experience, strong TypeScript skills, familiarity with REST APIs"
          hint="Separate requirement items with commas or newlines - displayed as a checklist to candidates."
          error={errors.eligibility?.message}
          {...register("eligibility")}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
