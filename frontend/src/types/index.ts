export type UserRole = "student" | "recruiter";

export interface Job {
  _id: string;
  title: string;
  company: string;
  openings: number;
  eligibility?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedJobs {
  items: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AuthUser {
  id: string;
  role: UserRole;
  /** Stored locally; the backend does not persist user profiles yet. */
  name?: string;
  email?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** Client-side record of a job application (no backend endpoint yet). */
export interface LocalApplication {
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: "applied" | "under-review" | "shortlisted";
}

/** Client-side notification record (no backend endpoint yet). */
export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
