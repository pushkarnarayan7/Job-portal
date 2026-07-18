import { http } from "./http";
import type { ApiSuccess, Job, PaginatedJobs } from "@/types";

export interface JobsQuery {
  search?: string;
  company?: string;
  page?: number;
  limit?: number;
}

export interface JobPayload {
  title: string;
  company: string;
  openings: number;
  eligibility?: string;
}

export const jobsService = {
  async list(query: JobsQuery = {}): Promise<PaginatedJobs> {
    const res = await http.get<ApiSuccess<PaginatedJobs>>("/jobs", { params: query });
    return res.data.data;
  },

  async getById(id: string): Promise<Job> {
    const res = await http.get<ApiSuccess<Job>>(`/jobs/${id}`);
    return res.data.data;
  },

  async create(payload: JobPayload): Promise<Job> {
    const res = await http.post<ApiSuccess<Job>>("/jobs", payload);
    return res.data.data;
  },

  async update(id: string, payload: JobPayload): Promise<Job> {
    const res = await http.put<ApiSuccess<Job>>(`/jobs/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/jobs/${id}`);
  },
};
