import type { Request, Response } from "express";
import { Job } from "../models/job.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, company, page = "1", limit = "10" } = req.query as {
      search?: string;
      company?: string;
      page?: string;
      limit?: string;
    };

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (company) {
      filter.company = company;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Job.countDocuments(filter);

    res.status(200).json(
      successResponse("Jobs fetched successfully", {
        items: jobs,
        total,
        page: pageNumber,
        limit: limitNumber,
      })
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json(errorResponse("Failed to fetch jobs"));
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    res
      .status(200)
      .json(successResponse("Job fetched successfully", job));
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json(errorResponse("Failed to fetch job"));
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  const { title, company, openings, eligibility } = req.body;

  if (!title || !company || !openings) {
    res
      .status(400)
      .json(errorResponse("title, company and openings are required"));
    return;
  }

  if (!req.user) {
    res.status(401).json(errorResponse("Unauthenticated"));
    return;
  }

  try {
    const job = await Job.create({
      title,
      company,
      openings,
      eligibility,
      createdBy: req.user.userId,
    });

    res.status(201).json(successResponse("Job created successfully", job));
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json(errorResponse("Failed to create job"));
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, company, openings, eligibility } = req.body;

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { title, company, openings, eligibility },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    res
      .status(200)
      .json(successResponse("Job updated successfully", updatedJob));
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json(errorResponse("Failed to update job"));
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      res.status(404).json(errorResponse("Job not found"));
      return;
    }

    res.status(200).json(successResponse("Job deleted successfully"));
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json(errorResponse("Failed to delete job"));
  }
};