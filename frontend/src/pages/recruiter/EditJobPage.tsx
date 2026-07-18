import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { jobsService, type JobPayload } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { Job } from "@/types";
import { JobForm } from "@/components/jobs/JobForm";
import { PageLoader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";

export function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    jobsService
      .getById(id)
      .then(setJob)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (payload: JobPayload) => {
    if (!id) return;
    try {
      await jobsService.update(id, payload);
      toast.success("Job updated");
      navigate("/recruiter/jobs");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  if (error || !job) {
    return <ErrorState title="Job not found" message={error ?? "This job may have been deleted."} />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit Job</h1>
      <p className="mt-1 text-slate-500">Update the details of “{job.title}”.</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <JobForm
          submitLabel="Save changes"
          defaultValues={{
            title: job.title,
            company: job.company,
            openings: job.openings,
            eligibility: job.eligibility ?? "",
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
