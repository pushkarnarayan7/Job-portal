import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRecruiter } from "../middlewares/role.middleware.js";
import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
} from "../controllers/job.controllers.js";

const router = Router();

// Public job listing and detail routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected admin/recruiter routes
router.post("/", requireAuth, requireRecruiter, createJob);
router.put("/:id", requireAuth, requireRecruiter, updateJob);
router.delete("/:id", requireAuth, requireRecruiter, deleteJob);

export default router;