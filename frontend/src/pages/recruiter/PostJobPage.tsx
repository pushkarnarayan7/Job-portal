import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { jobsService, type JobPayload } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import { JobForm } from "@/components/jobs/JobForm";

export function PostJobPage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload: JobPayload) => {
    try {
      await jobsService.create(payload);
      toast.success("Job posted successfully");
      navigate("/recruiter/jobs");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Post a Job</h1>
      <p className="mt-1 text-slate-500">
        Fill in the role details — your posting goes live immediately.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <JobForm submitLabel="Publish job" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
