import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Briefcase, Bell, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { applicationStore, bookmarkStore, notificationStore, profileStore } from "@/lib/storage";
import { jobsService } from "@/services/jobs.service";
import type { Job, LocalApplication } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export function StudentOverviewPage() {
  const { user } = useAuth();
  const [applications] = useState<LocalApplication[]>(() => applicationStore.getAll());
  const [savedCount] = useState(() => bookmarkStore.getAll().length);
  const [unread] = useState(() => notificationStore.unreadCount());
  const [profile] = useState(() => profileStore.get());
  const [suggested, setSuggested] = useState<Job[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  useEffect(() => {
    jobsService
      .list({ limit: 3 })
      .then((data) => setSuggested(data.items))
      .catch(() => setSuggested([]))
      .finally(() => setLoadingSuggested(false));
  }, []);

  const stats = [
    { icon: Briefcase, label: "Applications", value: applications.length, to: "/dashboard/applications" },
    { icon: Bookmark, label: "Saved Jobs", value: savedCount, to: "/dashboard/saved" },
    { icon: Bell, label: "Unread Alerts", value: unread, to: "/dashboard/notifications" },
    { icon: FileText, label: "Resume", value: profile.resumeFileName ? "Uploaded" : "Missing", to: "/dashboard/profile" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-slate-500">Here is a snapshot of your job search.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon className="h-5 w-5 text-primary-600" />
            </span>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent applications</h2>
          <Link
            to="/dashboard/applications"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {applications.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.jobId}
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="truncate font-medium text-slate-900 hover:text-primary-600"
                  >
                    {app.jobTitle}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {app.company} · {formatDate(app.appliedAt)}
                  </p>
                </div>
                <Badge tone="blue">{app.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            You haven&apos;t applied to any jobs yet.{" "}
            <Link to="/jobs" className="font-medium text-primary-600">
              Browse open roles
            </Link>
            .
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Suggested for you</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loadingSuggested
            ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            : suggested.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      </section>
    </div>
  );
}
