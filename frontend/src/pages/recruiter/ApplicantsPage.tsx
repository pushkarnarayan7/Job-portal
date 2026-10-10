import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  FileText,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { applicationsService } from "@/services/applications.service";
import { jobsService } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { BackendApplication, Job } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatDate, getInitials } from "@/lib/utils";

const statusTones = {
  applied: "blue",
  "under-review": "amber",
  shortlisted: "emerald",
  rejected: "red",
} as const;

export function ApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [applicants, setApplicants] = useState<BackendApplication[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected applicant modal view
  const [selectedApplicant, setSelectedApplicant] = useState<BackendApplication | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Fetch all recruiter's jobs
  useEffect(() => {
    jobsService
      .list({ limit: 100 })
      .then((data) => {
        setJobs(data.items);
        if (!selectedJobId && data.items.length > 0) {
          setSelectedJobId(data.items[0]._id);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Fetch applicants when selectedJobId changes
  const fetchApplicants = useCallback((jobId: string) => {
    if (!jobId) {
      setApplicants([]);
      return;
    }
    setLoadingApplicants(true);
    setError(null);
    applicationsService
      .getApplicantsByJob(jobId)
      .then((res) => {
        setApplicants(res.applicants);
        setJobTitle(res.job?.title || "");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingApplicants(false));
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId, fetchApplicants]);

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId) {
      setSearchParams({ jobId });
    } else {
      setSearchParams({});
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingStatusId(appId);
    try {
      const updated = await applicationsService.updateStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: updated.status } : app))
      );
      if (selectedApplicant && selectedApplicant._id === appId) {
        setSelectedApplicant((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
      toast.success(`Applicant status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = applicants.length;
  const appliedCount = applicants.filter((a) => a.status === "applied").length;
  const reviewCount = applicants.filter((a) => a.status === "under-review").length;
  const shortlistedCount = applicants.filter((a) => a.status === "shortlisted").length;
  const rejectedCount = applicants.filter((a) => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="mt-1 text-slate-500">
            Review and manage candidates who applied to your job openings.
          </p>
        </div>

        {/* Job selector dropdown */}
        {jobs.length > 0 && (
          <div className="w-full sm:w-72">
            <label htmlFor="job-selector" className="sr-only">
              Select job posting
            </label>
            <div className="relative">
              <select
                id="job-selector"
                value={selectedJobId}
                onChange={(e) => handleJobChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.company})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {loadingJobs ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No jobs posted yet"
          description="You haven't posted any job openings. Post a job to start receiving applications."
        />
      ) : (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Applicants</span>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Applied</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-600">{appliedCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Under Review</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-600">{reviewCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Shortlisted</span>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{shortlistedCount}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Rejected</span>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
              <Input
                placeholder="Search candidates or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
              {(["all", "applied", "under-review", "shortlisted", "rejected"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {status.replace("-", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Applicants Table */}
          {error ? (
            <ErrorState message={error} onRetry={() => fetchApplicants(selectedJobId)} />
          ) : loadingApplicants ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applicants found"
              description={
                searchTerm || statusFilter !== "all"
                  ? "Try clearing your search or status filters."
                  : `No candidates have applied to ${jobTitle || "this job"} yet.`
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Contact</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Resume</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">Applied</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 text-xs">
                            {getInitials(app.applicantName)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{app.applicantName}</p>
                            <p className="text-xs text-slate-500 sm:hidden">{app.applicantEmail}</p>
                            {app.skills && app.skills.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {app.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {app.skills.length > 3 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{app.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {app.applicantEmail}
                          </p>
                          {app.phone && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {app.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        {app.resumeFileName ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md">
                            <FileText className="h-3.5 w-3.5" />
                            {app.resumeFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-4 text-slate-600 text-xs sm:table-cell">
                        {formatDate(app.appliedAt || app.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={app.status}
                          disabled={updatingStatusId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 ${
                            app.status === "shortlisted"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-500"
                              : app.status === "under-review"
                              ? "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500"
                              : app.status === "rejected"
                              ? "border-red-200 bg-red-50 text-red-700 focus:ring-red-500"
                              : "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500"
                          }`}
                        >
                          <option value="applied">Applied</option>
                          <option value="under-review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplicant(app)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Applicant detail modal */}
      {selectedApplicant && (
        <Modal
          open={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title="Applicant Details"
        >
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
                  {getInitials(selectedApplicant.applicantName)}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedApplicant.applicantName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applied on {formatDate(selectedApplicant.appliedAt || selectedApplicant.createdAt)}
                  </p>
                </div>
              </div>
              <Badge tone={statusTones[selectedApplicant.status] || "blue"}>
                {selectedApplicant.status}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Email Address</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {selectedApplicant.applicantEmail}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Phone Number</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {selectedApplicant.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Resume */}
            <div>
              <h4 className="text-xs font-medium text-slate-500">Resume</h4>
              {selectedApplicant.resumeFileName ? (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-slate-800">
                      {selectedApplicant.resumeFileName}
                    </span>
                  </div>
                  <Badge tone="emerald">Attached</Badge>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500 italic">No resume attached.</p>
              )}
            </div>

            {/* Skills */}
            {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500">Skills</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedApplicant.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            <div>
              <h4 className="text-xs font-medium text-slate-500">Cover Letter</h4>
              <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700 whitespace-pre-wrap">
                {selectedApplicant.coverLetter || "No cover letter provided."}
              </div>
            </div>

            {/* Application Status actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs text-slate-500">Update candidate status:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedApplicant.status === "under-review" ? "secondary" : "outline"}
                  onClick={() => handleStatusChange(selectedApplicant._id, "under-review")}
                >
                  Under Review
                </Button>
                <Button
                  size="sm"
                  variant={selectedApplicant.status === "shortlisted" ? "primary" : "outline"}
                  onClick={() => handleStatusChange(selectedApplicant._id, "shortlisted")}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant={selectedApplicant.status === "rejected" ? "danger" : "outline"}
                  onClick={() => handleStatusChange(selectedApplicant._id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
