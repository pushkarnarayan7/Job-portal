export type UserRole = "student" | "recruiter";

export interface Job {
  _id: string;
  title: string;
  company: string;
  openings: number;
  eligibility?: string;
  description?: string;
  discloseSalary?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  benefits?: string[];
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
  role?: UserRole;
}

/** Client-side record of a job application (no backend endpoint yet). */
export interface LocalApplication {
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: "applied" | "under-review" | "shortlisted" | "rejected";
  applicantName: string;
  applicantEmail: string;
  phone: string;
  resumeFileName: string | null;
  coverLetter: string;
  skills: string[];
}

/** Application record returned from the backend API. */
export interface BackendApplication {
  _id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  resumeFileName: string | null;
  coverLetter: string;
  skills: string[];
  status: "applied" | "under-review" | "shortlisted" | "rejected";
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Applicants response for a specific job (recruiter view). */
export interface JobApplicantsResponse {
  job: {
    _id: string;
    title: string;
    company: string;
  };
  applicants: BackendApplication[];
  total: number;
}

/** Client-side notification record (no backend endpoint yet). */
export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

