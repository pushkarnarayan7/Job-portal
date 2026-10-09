import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserResponse,
} from "../types/auth.types.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { signJwt } from "../utils/jwt.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as RegisterRequest;

    if (!data.name || !data.email || !data.password) {
      res
        .status(400)
        .json(errorResponse("Name, email and password are required"));
      return;
    }

    const trimmedName = data.name.trim();
    const normalizedEmail = data.email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      res
        .status(400)
        .json(errorResponse("Name must be at least 2 characters long"));
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400).json(errorResponse("Please provide a valid email address"));
      return;
    }

    if (data.password.length < 6) {
      res
        .status(400)
        .json(errorResponse("Password must be at least 6 characters long"));
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res
        .status(400)
        .json(errorResponse("An account with this email already exists"));
      return;
    }

    const requestedRole = data.role === "recruiter" ? "recruiter" : "student";
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: requestedRole,
    });

    const responseData: RegisterResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res
      .status(201)
      .json(
        successResponse<RegisterResponse>("User registered successfully", responseData)
      );
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json(errorResponse("Failed to register user"));
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as LoginRequest;

    if (!data.email || !data.password) {
      res.status(400).json(errorResponse("Email and password are required"));
      return;
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json(errorResponse("Invalid email or password"));
      return;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json(errorResponse("Invalid email or password"));
      return;
    }

    const token = signJwt({
      userId: user._id.toString(),
      role: user.role,
    });

    const responseData: LoginResponse = {
      token,
      role: user.role,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    res.status(200).json(successResponse("Login successful", responseData));
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json(errorResponse("Failed to login"));
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse("Unauthenticated"));
      return;
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res.status(404).json(errorResponse("User not found"));
      return;
    }

    const responseData: UserResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json(successResponse("Current user", responseData));
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json(errorResponse("Failed to fetch user profile"));
  }
};
