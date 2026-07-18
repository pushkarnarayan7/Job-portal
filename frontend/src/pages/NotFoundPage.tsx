import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <Compass className="h-8 w-8 text-primary-600" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary-600">
        404 error
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button>Go home</Button>
        </Link>
        <Link to="/jobs">
          <Button variant="outline">Browse jobs</Button>
        </Link>
      </div>
    </div>
  );
}
