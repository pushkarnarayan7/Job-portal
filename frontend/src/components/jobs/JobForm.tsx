import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  eligibility: z.string().max(2000, "Keep eligibility under 2000 characters").optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  defaultValues?: Partial<JobFormValues>;
  submitLabel: string;
  onSubmit: (payload: JobPayload) => Promise<void>;
}

export function JobForm({ defaultValues, submitLabel, onSubmit }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      company: defaultValues?.company ?? "",
      openings: defaultValues?.openings ?? 1,
      eligibility: defaultValues?.eligibility ?? "",
    },
  });

  const submit = handleSubmit(async (data) => {
    await onSubmit({
      title: data.title,
      company: data.company,
      openings: data.openings,
      eligibility: data.eligibility?.trim() || undefined,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input
        label="Job title"
        placeholder="e.g. Senior Frontend Engineer"
        error={errors.title?.message}
        {...register("title")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Company"
          placeholder="e.g. TechNova"
          error={errors.company?.message}
          {...register("company")}
        />
        <Input
          label="Number of openings"
          type="number"
          min={1}
          error={errors.openings?.message}
          {...register("openings")}
        />
      </div>
      <Textarea
        label="Eligibility & requirements"
        rows={5}
        placeholder="e.g. 3+ years React experience, strong TypeScript skills, familiarity with REST APIs"
        hint="Separate requirements with commas — they are shown as a checklist to candidates."
        error={errors.eligibility?.message}
        {...register("eligibility")}
      />
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
