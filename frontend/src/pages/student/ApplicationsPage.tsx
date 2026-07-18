import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { applicationStore } from "@/lib/storage";
import type { LocalApplication } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const statusTone = {
  applied: "blue",
  "under-review": "amber",
  shortlisted: "emerald",
} as const;

export function ApplicationsPage() {
  const [applications] = useState<LocalApplication[]>(() => applicationStore.getAll());

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Applied Jobs</h1>
      <p className="mt-1 text-slate-500">
        Track every application you have submitted through TalentHub.
      </p>

      <div className="mt-6">
        {applications.length === 0 ? (
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
                  <tr key={app.jobId} className="border-b border-slate-100 last:border-0">
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
                      <Badge tone={statusTone[app.status]}>{app.status}</Badge>
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
