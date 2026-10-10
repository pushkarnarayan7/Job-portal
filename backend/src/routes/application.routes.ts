import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRecruiter } from "../middlewares/role.middleware.js";
import {
  applyToJob,
  checkApplication,
  getApplicantsByJob,
  getApplicationCounts,
  getMyApplications,
  updateApplicationStatus,
} from "../controllers/application.controllers.js";

const router = Router();

// Student routes
router.post("/", requireAuth, applyToJob);
router.get("/my", requireAuth, getMyApplications);
router.get("/check/:jobId", requireAuth, checkApplication);

// Recruiter routes
router.get("/job/:jobId", requireAuth, requireRecruiter, getApplicantsByJob);
router.get("/counts", requireAuth, requireRecruiter, getApplicationCounts);
router.patch("/:id/status", requireAuth, requireRecruiter, updateApplicationStatus);

export default router;
