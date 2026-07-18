import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { bookmarkStore } from "@/lib/storage";
import { jobsService } from "@/services/jobs.service";
import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = bookmarkStore.getAll();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    // No batch endpoint exists, so fetch each saved job individually and
    // silently drop any that were deleted since being bookmarked.
    Promise.allSettled(ids.map((id) => jobsService.getById(id)))
      .then((results) => {
        const found = results
          .filter((r): r is PromiseFulfilledResult<Job> => r.status === "fulfilled")
          .map((r) => r.value);
        setJobs(found);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
      <p className="mt-1 text-slate-500">Jobs you bookmarked to revisit later.</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Tap the bookmark icon on any job to save it for later."
            action={
              <Link to="/jobs">
                <Button>Browse jobs</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
