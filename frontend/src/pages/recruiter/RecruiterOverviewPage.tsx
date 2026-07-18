import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp, Eye, Plus, ArrowRight } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { Job } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export function RecruiterOverviewPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jobsService
      .list({ limit: 100 })
      .then((data) => {
        setJobs(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const totalOpenings = jobs.reduce((sum, j) => sum + j.openings, 0);

  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: loading ? "—" : String(total) },
    { icon: Users, label: "Total Openings", value: loading ? "—" : String(totalOpenings) },
    // The backend has no applicants or views tracking yet; shown as placeholders.
    { icon: TrendingUp, label: "Applicants", value: "N/A" },
    { icon: Eye, label: "Job Views", value: "N/A" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-slate-500">Manage your job postings and hiring pipeline.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button>
            <Plus className="h-4 w-4" />
            Post a job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon className="h-5 w-5 text-primary-600" />
            </span>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent postings</h2>
          <Link
            to="/recruiter/jobs"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Manage all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorState message={error} />
          </div>
        ) : loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            You haven&apos;t posted any jobs yet.{" "}
            <Link to="/recruiter/jobs/new" className="font-medium text-primary-600">
              Post your first job
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="truncate font-medium text-slate-900 hover:text-primary-600"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {job.company} · Posted {formatDate(job.createdAt)}
                  </p>
                </div>
                <Badge tone="emerald">
                  {job.openings} opening{job.openings > 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
