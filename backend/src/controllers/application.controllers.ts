import type { Request, Response } from "express";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

/**
 * POST /api/applications
 * A student submits an application for a job with their details.
 */
export const applyToJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const { jobId, applicantName, applicantEmail, phone, resumeFileName, coverLetter, skills } =
      req.body;

    if (!jobId || !applicantName || !applicantEmail) {
      res
        .status(400)
        .json(errorResponse("jobId, applicantName, and applicantEmail are required"));
      return;
    }

    // Verify the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    // Check if user already applied
    const existing = await Application.findOne({
      jobId,
      applicantId: req.user.userId,
    });
    if (existing) {
      res.status(409).json(errorResponse("You have already applied to this job"));
      return;
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.userId,
      applicantName,
      applicantEmail,
      phone: phone || "",
      resumeFileName: resumeFileName || null,
      coverLetter: coverLetter || "",
      skills: skills || [],
    });

    res
      .status(201)
      .json(successResponse("Application submitted successfully", application));
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json(errorResponse("Failed to submit application"));
  }
};

/**
 * GET /api/applications/job/:jobId
 * Recruiter views all applicants for a specific job they posted.
 */
export const getApplicantsByJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const { jobId } = req.params;

    // Verify the job exists and was created by this recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    if (job.createdBy !== req.user.userId) {
      res.status(403).json(errorResponse("You can only view applicants for your own jobs"));
      return;
    }

    const applicants = await Application.find({ jobId }).sort({ appliedAt: -1 });

    res.status(200).json(
      successResponse("Applicants fetched successfully", {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
        },
        applicants,
        total: applicants.length,
      })
    );
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json(errorResponse("Failed to fetch applicants"));
  }
};

/**
 * GET /api/applications/my
 * A student views all their own applications.
 */
export const getMyApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const applications = await Application.find({
      applicantId: req.user.userId,
    })
      .sort({ appliedAt: -1 })
      .populate("jobId", "title company openings");

    res
      .status(200)
      .json(successResponse("Applications fetched successfully", applications));
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json(errorResponse("Failed to fetch applications"));
  }
};

/**
 * GET /api/applications/check/:jobId
 * Check if the current user has already applied to a job.
 */
export const checkApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const { jobId } = req.params;
    const existing = await Application.findOne({
      jobId,
      applicantId: req.user.userId,
    });

    res.status(200).json(
      successResponse("Check complete", {
        hasApplied: !!existing,
        application: existing,
      })
    );
  } catch (error) {
    console.error("Error checking application:", error);
    res.status(500).json(errorResponse("Failed to check application status"));
  }
};

/**
 * PATCH /api/applications/:id/status
 * Recruiter updates the status of an application.
 */
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["applied", "under-review", "shortlisted", "rejected"].includes(status)) {
      res.status(400).json(errorResponse("Invalid status value"));
      return;
    }

    const application = await Application.findById(id);
    if (!application) {
      res.status(404).json(errorResponse("Application not found"));
      return;
    }

    // Verify the recruiter owns the job
    const job = await Job.findById(application.jobId);
    if (!job || job.createdBy !== req.user.userId) {
      res
        .status(403)
        .json(errorResponse("You can only update applications for your own jobs"));
      return;
    }

    application.status = status;
    await application.save();

    res
      .status(200)
      .json(successResponse("Application status updated", application));
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json(errorResponse("Failed to update application status"));
  }
};

/**
 * GET /api/applications/counts
 * Recruiter gets applicant counts for all their jobs.
 */
export const getApplicationCounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    // Find all jobs by this recruiter
    const recruiterJobs = await Job.find({ createdBy: req.user.userId }).select("_id");
    const jobIds = recruiterJobs.map((j) => j._id);

    // Aggregate counts per job
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    const countsMap: Record<string, number> = {};
    for (const c of counts) {
      countsMap[c._id.toString()] = c.count;
    }

    res
      .status(200)
      .json(successResponse("Application counts fetched", countsMap));
  } catch (error) {
    console.error("Error fetching application counts:", error);
    res.status(500).json(errorResponse("Failed to fetch application counts"));
  }
};
