import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * The backend does not yet expose an applications/applicants API,
 * so this page presents a professional placeholder until it exists.
 */
export function ApplicantsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
      <p className="mt-1 text-slate-500">
        Review candidates who applied to your job postings.
      </p>

      <div className="mt-6">
        <EmptyState
          icon={Users}
          title="Applicant tracking coming soon"
          description="Candidate applications will appear here once the applications API is available on the backend. Job postings and management are fully functional in the meantime."
        />
      </div>
    </div>
  );
}
