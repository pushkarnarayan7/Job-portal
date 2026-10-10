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
  FileText,
  X,
  DollarSign,
  EyeOff,
  Gift,
} from "lucide-react";
import toast from "react-hot-toast";
import { jobsService } from "@/services/jobs.service";
import { applicationsService } from "@/services/applications.service";
import { getErrorMessage } from "@/services/http";
import type { Job } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { applicationStore, bookmarkStore, notificationStore, profileStore } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard } from "@/components/jobs/JobCard";
import { cn, formatDate, formatSalary, getInitials } from "@/lib/utils";

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
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Application form state
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    phone: "",
    resumeFileName: null as string | null,
    coverLetter: "",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

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

  // Also check backend for application status
  useEffect(() => {
    if (!id || !user) return;
    applicationsService
      .checkApplication(id)
      .then((result) => {
        if (result.hasApplied) {
          setApplied(true);
        }
      })
      .catch(() => {
        // Ignore – fall back to local check
      });
  }, [id, user]);

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
    // Pre-fill from profile data
    const profile = profileStore.get();
    setFormData({
      applicantName: profile.name || user.name || "",
      applicantEmail: profile.email || user.email || "",
      phone: "",
      resumeFileName: profile.resumeFileName || null,
      coverLetter: "",
      skills: profile.skills.length > 0 ? [...profile.skills] : [],
    });
    setSkillInput("");
    setFormOpen(true);
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (formData.skills.includes(skill)) {
      setSkillInput("");
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const confirmApply = async () => {
    if (!formData.applicantName.trim() || !formData.applicantEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      // Submit to backend
      await applicationsService.apply({
        jobId: job._id,
        applicantName: formData.applicantName.trim(),
        applicantEmail: formData.applicantEmail.trim(),
        phone: formData.phone.trim(),
        resumeFileName: formData.resumeFileName,
        coverLetter: formData.coverLetter.trim(),
        skills: formData.skills,
      });

      // Also store locally for the student dashboard
      applicationStore.add({
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
        status: "applied",
        applicantName: formData.applicantName.trim(),
        applicantEmail: formData.applicantEmail.trim(),
        phone: formData.phone.trim(),
        resumeFileName: formData.resumeFileName,
        coverLetter: formData.coverLetter.trim(),
        skills: formData.skills,
      });

      notificationStore.add(
        "Application submitted",
        `Your application for ${job.title} at ${job.company} was submitted successfully.`
      );
      setApplied(true);
      setFormOpen(false);
      toast.success("Application submitted!");
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes("already applied")) {
        setApplied(true);
        setFormOpen(false);
        toast.error("You have already applied to this job");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
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
                {job.discloseSalary === false ? (
                  <Badge tone="amber">
                    <EyeOff className="mr-1 h-3 w-3" />
                    Salary Undisclosed
                  </Badge>
                ) : (job.salaryMin || job.salaryMax) ? (
                  <Badge tone="emerald">
                    <DollarSign className="mr-1 h-3 w-3" />
                    {formatSalary(job.discloseSalary, job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                  </Badge>
                ) : null}
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

        {/* Detailed Description */}
        <section>
          <h2 className="text-lg font-bold text-slate-900">About the role</h2>
          <div className="mt-3 leading-relaxed text-slate-700 whitespace-pre-line text-sm sm:text-base">
            {job.description?.trim() ? (
              job.description
            ) : (
              <p>
                {job.company} is hiring a {job.title} to join their team. This role has {job.openings} open position{job.openings > 1 ? "s" : ""} and offers the opportunity to work on meaningful projects with an innovative team.
              </p>
            )}
          </div>
        </section>

        {/* Salary & Compensation */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Compensation &amp; Salary</h2>
          </div>
          <div className="mt-2 text-sm text-slate-700">
            {job.discloseSalary === false ? (
              <div className="flex items-center gap-2 text-slate-600 bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg">
                <EyeOff className="h-4 w-4 text-amber-600 shrink-0" />
                <span>The employer has chosen to keep salary details undisclosed for this position.</span>
              </div>
            ) : (job.salaryMin || job.salaryMax) ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-slate-900">
                <span className="text-xl font-bold text-emerald-700">
                  {formatSalary(job.discloseSalary, job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                </span>
                <span className="text-xs text-slate-500">
                  ({job.salaryPeriod === "year" ? "Annual base compensation" : job.salaryPeriod === "month" ? "Monthly salary" : "Hourly pay rate"})
                </span>
              </div>
            ) : (
              <span className="text-slate-500 italic">Salary details not specified by recruiter.</span>
            )}
          </div>
        </section>

        {/* Benefits & Perks */}
        {job.benefits && job.benefits.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">Perks &amp; Benefits</h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/60 px-3 py-1.5 text-xs font-semibold text-purple-800"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  {benefit}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Requirements & Eligibility */}
        {job.eligibility && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Requirements &amp; Eligibility</h2>
            <ul className="mt-3 space-y-2">
              {job.eligibility.split(/[,;\n]/).filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
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

      {/* Application Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Apply for this position">
        <div className="space-y-4">
          <div className="rounded-lg bg-primary-50/50 p-3">
            <p className="text-sm text-slate-600">
              Applying for <span className="font-semibold text-slate-900">{job.title}</span> at{" "}
              <span className="font-semibold text-slate-900">{job.company}</span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name *"
              placeholder="Your full name"
              value={formData.applicantName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, applicantName: e.target.value }))
              }
            />
            <Input
              label="Email *"
              type="email"
              placeholder="your@email.com"
              value={formData.applicantEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, applicantEmail: e.target.value }))
              }
            />
          </div>

          <Input
            label="Phone number"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          {/* Resume display */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Resume
            </label>
            {formData.resumeFileName ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {formData.resumeFileName}
                  </span>
                  <Badge tone="emerald">Attached</Badge>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, resumeFileName: null }))
                  }
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Remove resume"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-center text-sm text-slate-400">
                No resume attached.{" "}
                <Link
                  to="/dashboard/profile"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Upload on your profile
                </Link>
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Skills
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. React, Node.js"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-primary-400 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Textarea
            label="Cover letter"
            rows={4}
            placeholder="Tell the recruiter why you're a great fit for this role..."
            value={formData.coverLetter}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApply} isLoading={submitting}>
              Submit application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
