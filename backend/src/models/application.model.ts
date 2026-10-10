import mongoose, { Schema, Document } from "mongoose";

export interface ApplicationDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  resumeFileName: string | null;
  coverLetter: string;
  skills: string[];
  status: "applied" | "under-review" | "shortlisted" | "rejected";
  appliedAt: Date;
}

const ApplicationSchema = new Schema<ApplicationDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantId: {
      type: String,
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    applicantEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    resumeFileName: {
      type: String,
      default: null,
    },
    coverLetter: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["applied", "under-review", "shortlisted", "rejected"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One user can apply to a job only once
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export const Application = mongoose.model<ApplicationDocument>(
  "Application",
  ApplicationSchema
);
