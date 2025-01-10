import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import dbConnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js"; // Assuming this is a custom middleware
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import messageRouter from "./routes/messageRouter.js";
import skillRouter from "./routes/skillRouter.js";
import softwareApplicationRouter from "./routes/softwareApplicationRouter.js";
import projectRouter from "./routes/projectRouter.js";
import ErrorHandler from "./middlewares/ErrorHander.js"; // Ensure the ErrorHandler class is imported

const app = express();
dotenv.config({ path: "./config/config.env" });

// Initialize database connection
dbConnection();

// CORS configuration with credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.PORTFOLIO_URL || "http://localhost:5174", // Portfolio URL
        process.env.DASHBOARD_URL || "http://localhost:5173", // Dashboard URL
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Pre-flight handling for OPTIONS requests
app.options("*", cors());

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/project", projectRouter);

// Handle unsupported routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found`, 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
