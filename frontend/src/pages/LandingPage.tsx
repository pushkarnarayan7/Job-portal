import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Briefcase,
  Building2,
  Users,
  FileCheck,
  UserPlus,
  Send,
  Code2,
  Megaphone,
  LineChart,
  Palette,
  Stethoscope,
  GraduationCap,
  Quote,
} from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    jobsService
      .list({ limit: 6 })
      .then((data) => setFeatured(data.items))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/jobs?search=${encodeURIComponent(query.trim())}` : "/jobs");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_25rem_at_top,#eff6ff,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Over 10,000 opportunities waiting
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find the job that{" "}
                <span className="text-primary-600">builds your future</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
                TalentHub connects ambitious students and professionals with
                companies that are shaping tomorrow. Search, apply, and get hired.
              </p>
            </motion.div>

            <motion.form
              {...fadeUp}
              transition={{ duration: 0.45, delay: 0.1 }}
              onSubmit={onSearch}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-card"
            >
              <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title or company..."
                className="h-10 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                aria-label="Search jobs"
              />
              <Button type="submit" size="md" className="shrink-0">
                Search Jobs
              </Button>
            </motion.form>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="mt-4 text-sm text-slate-500"
            >
              Popular: Frontend, Backend, Product Design, Data Science
            </motion.p>
          </div>
        </div>
      </section>

      {/* Featured companies */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-400">
            Trusted by teams at
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["TechNova", "CloudWorks", "DataSphere", "PixelForge", "FinEdge", "HealthPlus"].map(
              (name) => (
                <span
                  key={name}
                  className="flex items-center gap-2 text-lg font-semibold text-slate-400"
                >
                  <Building2 className="h-5 w-5" />
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Featured Jobs
              </h2>
              <p className="mt-1 text-slate-500">
                Fresh opportunities posted by verified recruiters.
              </p>
            </div>
            <Link
              to="/jobs"
              className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:flex"
            >
              View all jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loadingJobs
              ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
              : featured.map((job) => <JobCard key={job._id} job={job} />)}
          </div>

          {!loadingJobs && featured.length === 0 && (
            <p className="mt-8 text-center text-sm text-slate-500">
              No jobs posted yet — check back soon or{" "}
              <Link to="/register" className="font-medium text-primary-600">
                become a recruiter
              </Link>{" "}
              and post the first one.
            </p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/jobs">
              <Button variant="outline">View all jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Popular Categories
            </h2>
            <p className="mt-1 text-slate-500">Explore roles across every discipline.</p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Code2, label: "Engineering" },
              { icon: Palette, label: "Design" },
              { icon: Megaphone, label: "Marketing" },
              { icon: LineChart, label: "Finance" },
              { icon: Stethoscope, label: "Healthcare" },
              { icon: GraduationCap, label: "Education" },
            ].map(({ icon: Icon, label }) => (
              <motion.div key={label} {...fadeUp}>
                <Link
                  to={`/jobs?search=${encodeURIComponent(label)}`}
                  className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How It Works</h2>
            <p className="mt-1 text-slate-500">Get hired in three simple steps.</p>
          </motion.div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "Create your account",
                text: "Sign up in under a minute and set up your professional profile.",
              },
              {
                icon: Search,
                title: "Discover opportunities",
                text: "Search and filter thousands of curated roles from real companies.",
              },
              {
                icon: Send,
                title: "Apply and get hired",
                text: "Apply with one click and track your applications from your dashboard.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                {...fadeUp}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <span className="absolute -top-3 left-6 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  Step {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                  <Icon className="h-6 w-6 text-primary-600" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Briefcase, value: "10,000+", label: "Active Jobs" },
            { icon: Building2, value: "2,500+", label: "Companies" },
            { icon: Users, value: "150K+", label: "Job Seekers" },
            { icon: FileCheck, value: "45K+", label: "Successful Hires" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="h-7 w-7 text-primary-200" />
              <span className="mt-2 text-3xl font-extrabold text-white">{value}</span>
              <span className="mt-1 text-sm text-primary-100">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Loved by job seekers and recruiters
            </h2>
            <p className="mt-1 text-slate-500">
              Here is what our community says about TalentHub.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "I found my first internship within two weeks. The application tracking made the whole process stress-free.",
                name: "Ananya Sharma",
                role: "CS Student, Delhi",
              },
              {
                quote:
                  "As a recruiter, posting jobs and managing openings is refreshingly simple. Our time-to-hire dropped significantly.",
                name: "Rahul Mehta",
                role: "Talent Lead, TechNova",
              },
              {
                quote:
                  "Clean, fast, and no noise. TalentHub feels like a product built by people who understand hiring.",
                name: "Sara Iyer",
                role: "Product Designer",
              },
            ].map(({ quote, name, role }, i) => (
              <motion.figure
                key={name}
                {...fadeUp}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <Quote className="h-6 w-6 text-primary-200" />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-14 text-center sm:px-14"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to take the next step in your career?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Join thousands of professionals who found their dream jobs through
              TalentHub. It takes less than a minute to get started.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Create free account
                </Button>
              </Link>
              <Link to="/jobs">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-600 bg-transparent text-white hover:bg-slate-800 sm:w-auto"
                >
                  Browse jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
