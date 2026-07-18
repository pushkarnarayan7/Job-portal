import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { jobsService } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { Job } from "@/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    jobsService
      .list({ limit: 100 })
      .then((data) => setJobs(data.items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await jobsService.remove(jobToDelete._id);
      toast.success("Job deleted");
      setJobToDelete(null);
      fetchJobs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Jobs</h1>
          <p className="mt-1 text-slate-500">Edit or remove your active job postings.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button>
            <Plus className="h-4 w-4" />
            Post a job
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job posting and start receiving applications."
            action={
              <Link to="/recruiter/jobs/new">
                <Button>Post your first job</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Openings</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Posted</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-medium text-slate-900 hover:text-primary-600"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-500">{job.company}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                      {job.openings}
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          aria-label={`Edit ${job.title}`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          aria-label={`Delete ${job.title}`}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        title="Delete this job?"
      >
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{jobToDelete?.title}</span> at{" "}
          <span className="font-semibold">{jobToDelete?.company}</span> will be permanently
          removed. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setJobToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleting}>
            Delete job
          </Button>
        </div>
      </Modal>
    </div>
  );
}
