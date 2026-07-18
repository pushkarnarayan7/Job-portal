import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { jobsService } from "@/services/jobs.service";
import { getErrorMessage } from "@/services/http";
import type { PaginatedJobs } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PAGE_SIZE = 9;

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const company = searchParams.get("company") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [companyInput, setCompanyInput] = useState(company);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [data, setData] = useState<PaginatedJobs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      search: search || undefined,
      company: company || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, company, page]
  );

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    jobsService
      .list(query)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (companyInput.trim()) params.company = companyInput.trim();
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput("");
    setCompanyInput("");
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(search || company);

  const filterPanel = (
    <div className="space-y-4">
      <Input
        label="Keyword"
        placeholder="Title or company..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
      />
      <Input
        label="Company (exact)"
        placeholder="e.g. TechNova"
        value={companyInput}
        onChange={(e) => setCompanyInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
      />
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} aria-label="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Browse Jobs</h1>
        <p className="mt-1 text-slate-500">
          {data ? `${data.total} open position${data.total === 1 ? "" : "s"}` : "Searching open positions..."}
        </p>
      </div>

      <div className="mb-6 lg:hidden">
        <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters {hasActiveFilters && "(active)"}
        </Button>
        {filtersOpen && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            {filterPanel}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </h2>
            {filterPanel}
          </div>
        </aside>

        <section>
          {error ? (
            <ErrorState message={error} onRetry={fetchJobs} />
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {data.items.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={data.page}
                  total={data.total}
                  limit={data.limit}
                  onPageChange={(p) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(p));
                    setSearchParams(params);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No jobs match your search"
              description="Try different keywords or clear your filters to see all open positions."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
