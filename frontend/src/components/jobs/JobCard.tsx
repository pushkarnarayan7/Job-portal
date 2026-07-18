import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Building2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { bookmarkStore } from "@/lib/storage";
import { cn, timeAgo, getInitials } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(() => bookmarkStore.has(job._id));

  const toggleBookmark = () => {
    const nowSaved = bookmarkStore.toggle(job._id);
    setBookmarked(nowSaved);
    toast.success(nowSaved ? "Job saved" : "Removed from saved jobs");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700">
            {getInitials(job.company)}
          </span>
          <div>
            <Link to={`/jobs/${job._id}`}>
              <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                {job.title}
              </h3>
            </Link>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark job"}
          className={cn(
            "rounded-lg p-2 transition-colors",
            bookmarked
              ? "text-primary-600"
              : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
          )}
        >
          <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
        </button>
      </div>

      {job.eligibility && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.eligibility}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="emerald">
          <Users className="mr-1 h-3 w-3" />
          {job.openings} opening{job.openings > 1 ? "s" : ""}
        </Badge>
        <Badge tone="slate">{timeAgo(job.createdAt)}</Badge>
      </div>
    </motion.article>
  );
}
