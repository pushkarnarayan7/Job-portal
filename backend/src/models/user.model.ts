import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "recruiter";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);

