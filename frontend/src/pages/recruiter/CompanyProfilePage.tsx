import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getInitials } from "@/lib/utils";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  website: z
    .string()
    .url("Enter a valid URL (including https://)")
    .or(z.literal("")),
  industry: z.string(),
  size: z.string(),
  about: z.string().max(1500, "Keep the description under 1500 characters"),
});

type CompanyForm = z.infer<typeof companySchema>;

const STORAGE_KEY = "jobportal.company";

function loadCompany(): CompanyForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CompanyForm;
  } catch {
    // fall through to defaults
  }
  return { name: "", website: "", industry: "", size: "", about: "" };
}

/**
 * Stored locally: the backend has no company profile endpoint yet.
 */
export function CompanyProfilePage() {
  const [company, setCompany] = useState<CompanyForm>(loadCompany);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: company,
  });

  const onSubmit = (data: CompanyForm) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setCompany(data);
    toast.success("Company profile saved");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
      <p className="mt-1 text-slate-500">
        This is how your company appears to candidates.
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700">
          {company.name ? getInitials(company.name) : <Building2 className="h-7 w-7" />}
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {company.name || "Your company"}
          </p>
          <p className="text-sm text-slate-500">
            {[company.industry, company.size && `${company.size} employees`]
              .filter(Boolean)
              .join(" · ") || "Add your company details below"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company name"
            placeholder="e.g. TechNova"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Website"
            placeholder="https://example.com"
            error={errors.website?.message}
            {...register("website")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Industry"
            placeholder="e.g. Software"
            error={errors.industry?.message}
            {...register("industry")}
          />
          <Input
            label="Company size"
            placeholder="e.g. 51-200"
            error={errors.size?.message}
            {...register("size")}
          />
        </div>
        <Textarea
          label="About the company"
          rows={5}
          placeholder="What does your company do? What makes it a great place to work?"
          error={errors.about?.message}
          {...register("about")}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Save profile
        </Button>
      </form>
    </div>
  );
}
