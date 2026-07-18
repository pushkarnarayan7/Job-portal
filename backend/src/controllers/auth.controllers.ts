import type { Request, Response } from "express";
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { signJwt } from "../utils/jwt.js";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as RegisterRequest;

  if (!data.name || !data.email || !data.password) {
    res
      .status(400)
      .json(errorResponse("name, email and password are required"));
    return;
  }

  const user: RegisterResponse = {
    id: "user_001",
    name: data.name,
    email: data.email,
  };

  res
    .status(201)
    .json(successResponse<RegisterResponse>("user registered successfully", user));
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as LoginRequest;

  if (!data.email || !data.password) {
    res.status(400).json(errorResponse("email and password are required"));
    return;
  }

  // Simple demo role logic: treat specific email as recruiter
  const role = data.email === "recruiter@jobportal.com" ? "recruiter" : "student";
  const userId = "user_001";

  const token = signJwt({
    userId,
    role,
  });

  res.status(200).json(
    successResponse("login successful", {
      token,
      role,
    })
  );
};

export const getCurrentUser = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json(errorResponse("Unauthenticated"));
    return;
  }

  res.status(200).json(
    successResponse("Current user", {
      id: req.user.userId,
      role: req.user.role,
    })
  );
};
