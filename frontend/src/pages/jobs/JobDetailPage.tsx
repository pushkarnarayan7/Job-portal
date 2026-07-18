import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Calendar,
  CheckCircle2,
  Users,
  BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { jobsService } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { Job } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { applicationStore, bookmarkStore, notificationStore } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard } from "@/components/jobs/JobCard";
import { cn, formatDate, getInitials } from "@/lib/utils";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [related, setRelated] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookmarked, setBookmarked] = useState(false);
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchJob = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    jobsService
      .getById(id)
      .then((data) => {
        setJob(data);
        setBookmarked(bookmarkStore.has(data._id));
        setApplied(applicationStore.has(data._id));
        return jobsService.list({ limit: 4 });
      })
      .then((list) => {
        if (list) setRelated(list.items.filter((j) => j._id !== id).slice(0, 3));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) return <PageLoader />;

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Job not found"
          message={error ?? "This job may have been removed."}
          onRetry={fetchJob}
        />
      </div>
    );
  }

  const toggleBookmark = () => {
    const nowSaved = bookmarkStore.toggle(job._id);
    setBookmarked(nowSaved);
    toast.success(nowSaved ? "Job saved" : "Removed from saved jobs");
  };

  const handleApply = () => {
    if (!user) {
      toast("Sign in to apply for this job");
      navigate("/login", { state: { from: `/jobs/${job._id}` } });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmApply = () => {
    applicationStore.add({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      status: "applied",
    });
    notificationStore.add(
      "Application submitted",
      `Your application for ${job.title} at ${job.company} was submitted successfully.`
    );
    setApplied(true);
    setConfirmOpen(false);
    toast.success("Application submitted!");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all jobs
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-bold text-primary-700">
              {getInitials(job.company)}
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{job.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-slate-500">
                <Building2 className="h-4 w-4" />
                {job.company}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="emerald">
                  <Users className="mr-1 h-3 w-3" />
                  {job.openings} opening{job.openings > 1 ? "s" : ""}
                </Badge>
                <Badge tone="blue">
                  <Calendar className="mr-1 h-3 w-3" />
                  Posted {formatDate(job.createdAt)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={toggleBookmark}
              aria-label={bookmarked ? "Remove bookmark" : "Save job"}
            >
              <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary-600 text-primary-600")} />
              {bookmarked ? "Saved" : "Save"}
            </Button>
            {applied ? (
              <Button variant="secondary" disabled>
                <BadgeCheck className="h-4 w-4" />
                Applied
              </Button>
            ) : (
              <Button onClick={handleApply}>Apply now</Button>
            )}
          </div>
        </div>

        <hr className="my-6 border-slate-200" />

        <section>
          <h2 className="font-semibold text-slate-900">About the role</h2>
          <p className="mt-2 leading-relaxed text-slate-600">
            {job.company} is hiring a {job.title} to join their growing team. This role
            has {job.openings} open position{job.openings > 1 ? "s" : ""} and offers the
            opportunity to work on meaningful products with a collaborative team.
          </p>
        </section>

        {job.eligibility && (
          <section className="mt-6">
            <h2 className="font-semibold text-slate-900">Requirements &amp; eligibility</h2>
            <ul className="mt-2 space-y-2">
              {job.eligibility.split(/[,;\n]/).filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Detailed descriptions, salary ranges, and benefits will appear here once the
          backend job model supports those fields.
        </section>
      </motion.div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Related jobs</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <JobCard key={j._id} job={j} />
            ))}
          </div>
        </section>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm application">
        <p className="text-sm text-slate-600">
          You are applying for <span className="font-semibold">{job.title}</span> at{" "}
          <span className="font-semibold">{job.company}</span>. Your profile details will
          be shared with the recruiter.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmApply}>Submit application</Button>
        </div>
      </Modal>
    </div>
  );
}
