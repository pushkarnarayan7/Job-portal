/// <reference path="./types/cors.d.ts" />
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";

const app = express();

// Comma-separated list of allowed origins, e.g.
// "https://your-app.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, Postman) that send no origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

export default app;


