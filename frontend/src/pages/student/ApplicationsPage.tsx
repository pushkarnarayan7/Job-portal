import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { applicationsService } from "@/services/applications.service";
import { applicationStore } from "@/lib/storage";
import type { LocalApplication } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

const statusTone = {
  applied: "blue",
  "under-review": "amber",
  shortlisted: "emerald",
  rejected: "red",
} as const;

interface UnifiedApp {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: "applied" | "under-review" | "shortlisted" | "rejected";
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<UnifiedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadApps() {
      try {
        const backendApps = await applicationsService.getMyApplications();
        const localApps = applicationStore.getAll();

        const combined: UnifiedApp[] = [];
        const seenJobIds = new Set<string>();

        // Backend apps take precedence
        for (const app of backendApps) {
          const jobObj = typeof app.jobId === "object" && app.jobId !== null
            ? (app.jobId as unknown as { _id: string; title: string; company: string })
            : null;
          
          const jId = jobObj?._id || (typeof app.jobId === "string" ? app.jobId : app._id);
          seenJobIds.add(jId);
          combined.push({
            id: app._id,
            jobId: jId,
            jobTitle: jobObj?.title || "Job Position",
            company: jobObj?.company || "Company",
            appliedAt: app.appliedAt || app.createdAt,
            status: app.status,
          });
        }

        // Add any local ones not yet in backend
        for (const local of localApps) {
          if (!seenJobIds.has(local.jobId)) {
            combined.push({
              id: local.jobId,
              jobId: local.jobId,
              jobTitle: local.jobTitle,
              company: local.company,
              appliedAt: local.appliedAt,
              status: local.status,
            });
          }
        }

        if (mounted) {
          setApplications(combined);
        }
      } catch {
        // Fallback to local
        if (mounted) {
          const localApps: UnifiedApp[] = applicationStore.getAll().map((l: LocalApplication) => ({
            id: l.jobId,
            jobId: l.jobId,
            jobTitle: l.jobTitle,
            company: l.company,
            appliedAt: l.appliedAt,
            status: l.status,
          }));
          setApplications(localApps);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadApps();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Applied Jobs</h1>
      <p className="mt-1 text-slate-500">
        Track every application you have submitted through L&amp;G.
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="When you apply to a job, it will show up here so you can track its progress."
            action={
              <Link to="/jobs">
                <Button>Browse jobs</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Company</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Applied on</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="font-medium text-slate-900 hover:text-primary-600"
                      >
                        {app.jobTitle}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500 sm:hidden">{app.company}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">
                      {app.company}
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[app.status] || "blue"}>{app.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

