import type { Request, Response, NextFunction } from "express";

export const requireRecruiter = (
    req: Request,
    res: Response,
    next: NextFunction
): void =>{
     if (!req.user) {
    res.status(401).json({
      message: "Unauthenticated",
    });
    return;
    }

    if (req.user.role !== "recruiter") {
    res.status(403).json({
      message: "Access denied. Recruiters only.",
    });
    return;
    }
    next();
};