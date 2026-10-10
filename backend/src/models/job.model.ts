import mongoose, { Schema, Document } from "mongoose";

export interface JobDocument extends Document {
  title: string;
  company: string;
  createdBy: string;
  openings: number;
  eligibility?: string;
  description?: string;
  discloseSalary?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  benefits?: string[];
}

const JobSchema = new Schema<JobDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    openings: {
      type: Number,
      required: true,
      min: 1,
    },
    eligibility: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    discloseSalary: {
      type: Boolean,
      default: true,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: "USD",
    },
    salaryPeriod: {
      type: String,
      default: "year",
    },
    benefits: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model<JobDocument>("Job", JobSchema);