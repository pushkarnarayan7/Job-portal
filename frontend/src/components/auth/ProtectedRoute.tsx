import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/Loader";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    const home = user.role === "recruiter" ? "/recruiter" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
