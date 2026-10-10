import { http } from "./http";
import type {
  ApiSuccess,
  BackendApplication,
  JobApplicantsResponse,
} from "@/types";

export interface ApplyPayload {
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  phone?: string;
  resumeFileName?: string | null;
  coverLetter?: string;
  skills?: string[];
}

export const applicationsService = {
  async apply(payload: ApplyPayload): Promise<BackendApplication> {
    const res = await http.post<ApiSuccess<BackendApplication>>(
      "/applications",
      payload
    );
    return res.data.data;
  },

  async getMyApplications(): Promise<BackendApplication[]> {
    const res = await http.get<ApiSuccess<BackendApplication[]>>(
      "/applications/my"
    );
    return res.data.data;
  },

  async checkApplication(
    jobId: string
  ): Promise<{ hasApplied: boolean; application: BackendApplication | null }> {
    const res = await http.get<
      ApiSuccess<{
        hasApplied: boolean;
        application: BackendApplication | null;
      }>
    >(`/applications/check/${jobId}`);
    return res.data.data;
  },

  async getApplicantsByJob(jobId: string): Promise<JobApplicantsResponse> {
    const res = await http.get<ApiSuccess<JobApplicantsResponse>>(
      `/applications/job/${jobId}`
    );
    return res.data.data;
  },

  async getApplicationCounts(): Promise<Record<string, number>> {
    const res = await http.get<ApiSuccess<Record<string, number>>>(
      "/applications/counts"
    );
    return res.data.data;
  },

  async updateStatus(
    applicationId: string,
    status: string
  ): Promise<BackendApplication> {
    const res = await http.patch<ApiSuccess<BackendApplication>>(
      `/applications/${applicationId}/status`,
      { status }
    );
    return res.data.data;
  },
};
