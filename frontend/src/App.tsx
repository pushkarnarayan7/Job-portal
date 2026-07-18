import { Routes, Route } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Bell,
  User,
  Settings,
  Plus,
  ClipboardList,
  Users,
  Building2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardLayout, type SidebarItem } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { LandingPage } from "@/pages/LandingPage";
import { JobsPage } from "@/pages/jobs/JobsPage";
import { JobDetailPage } from "@/pages/jobs/JobDetailPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

import { StudentOverviewPage } from "@/pages/student/StudentOverviewPage";
import { ApplicationsPage } from "@/pages/student/ApplicationsPage";
import { SavedJobsPage } from "@/pages/student/SavedJobsPage";
import { NotificationsPage } from "@/pages/student/NotificationsPage";
import { ProfilePage } from "@/pages/student/ProfilePage";
import { SettingsPage } from "@/pages/student/SettingsPage";

import { RecruiterOverviewPage } from "@/pages/recruiter/RecruiterOverviewPage";
import { ManageJobsPage } from "@/pages/recruiter/ManageJobsPage";
import { PostJobPage } from "@/pages/recruiter/PostJobPage";
import { EditJobPage } from "@/pages/recruiter/EditJobPage";
import { ApplicantsPage } from "@/pages/recruiter/ApplicantsPage";
import { CompanyProfilePage } from "@/pages/recruiter/CompanyProfilePage";

const studentSidebar: SidebarItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/applications", label: "Applied Jobs", icon: Briefcase },
  { to: "/dashboard/saved", label: "Saved Jobs", icon: Bookmark },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/profile", label: "Profile & Resume", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const recruiterSidebar: SidebarItem[] = [
  { to: "/recruiter", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/recruiter/jobs/new", label: "Post Job", icon: Plus },
  { to: "/recruiter/jobs", label: "Manage Jobs", icon: ClipboardList, end: true },
  { to: "/recruiter/applicants", label: "Applicants", icon: Users },
  { to: "/recruiter/company", label: "Company Profile", icon: Building2 },
];

export default function App() {
  return (
    <Routes>
      {/* Public pages with navbar + footer */}
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth pages (standalone) */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      {/* Student dashboard */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute role="student">
            <DashboardLayout items={studentSidebar} title="Dashboard" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentOverviewPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="saved" element={<SavedJobsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Recruiter dashboard */}
      <Route
        path="recruiter"
        element={
          <ProtectedRoute role="recruiter">
            <DashboardLayout items={recruiterSidebar} title="Recruiter" />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterOverviewPage />} />
        <Route path="jobs" element={<ManageJobsPage />} />
        <Route path="jobs/new" element={<PostJobPage />} />
        <Route path="jobs/:id/edit" element={<EditJobPage />} />
        <Route path="applicants" element={<ApplicantsPage />} />
        <Route path="company" element={<CompanyProfilePage />} />
      </Route>
    </Routes>
  );
}
