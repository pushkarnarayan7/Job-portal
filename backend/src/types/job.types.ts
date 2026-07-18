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